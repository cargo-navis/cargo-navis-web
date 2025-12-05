import { createColumnHelper } from '@tanstack/react-table';
import clsx from 'clsx';
import uniq from 'lodash/uniq';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { LoadStatus, type Shipment } from '@/lib/api';
import { InvoiceStatus } from '@/lib/api/shipments';
import { useClients, useContractors, useCurrentTenant, useEmployees, useVehicles } from '@/lib/hooks';
import { getDataPointDateString } from '@/lib/utils/date';
import { roundLdmValue } from '@/lib/utils/math';
import { renderVehicleName } from '@/lib/utils/vehicles';
import { Box, DisplayIf, Divider, FlexLayout, Icon, Pill, Table, Text } from '@/ui';

import { AddressesList } from './AddressesList';
import { invoiceStatusConfig, loadStatusConfig } from './const';
import { SortFieldEnum, useShipmentsSortQueryParamState } from './hooks';
import { ReferenceNumberTooltip } from './ReferenceNumberTooltip';
import { WarningTooltip } from './WarningTooltip';

const columnHelper = createColumnHelper<Shipment>();

export function ShipmentsTable({ shipments }: { shipments?: Shipment[] }) {
  const router = useRouter();
  const { data: clients = [] } = useClients();
  const { data: contractors = [] } = useContractors();
  const { data: tenant } = useCurrentTenant();
  const { data: vehicles = [] } = useVehicles();
  const { data: employees = [] } = useEmployees();
  const { toggleSort, isFieldSorted, getSortDirection } = useShipmentsSortQueryParamState();

  const columns = useMemo(() => {
    return [
      columnHelper.display({
        id: 'orderNumber',
        header: 'Broj naloga',
        enableSorting: false,
        size: 140,
        cell: ({ row }) => {
          const shipment = row.original;
          const hasSubshipments = (shipment.childShipments?.length ?? 0) > 0;
          const depth = row.depth;
          const isExpanded = row.getIsExpanded();
          const isSubshipment = depth !== 0;
          const isTenantTransporter = shipment.transportContractorId === tenant?.id;
          const isAgencyUse = shipment.isAgencyUse;
          const driver = employees.find((e) => e.id === shipment?.driverId);
          const hasMessageChannel = !!driver?.messageChannel;
          const isShipmentSentToDriver = shipment.sentToDriver;

          const canRenderWarning = !isSubshipment && !isAgencyUse;

          // Check for missing vehicle
          const isVehicleMissing = canRenderWarning && !shipment.vehicleId && isTenantTransporter;
          const isDriverMissing = canRenderWarning && !shipment.driverId && isTenantTransporter;
          const isNotSentToDriver = canRenderWarning && !isShipmentSentToDriver && hasMessageChannel;

          return (
            <FlexLayout className="items-center py-2 text-dark-700 dark:text-light-100 group-hover/row:text-teal-500 gap-2">
              {depth > 0 ? (
                <FlexLayout className="items-center gap-2">
                  <Text color="text-color-2" variant="text-xs-medium">
                    {shipment.orderNumber}
                  </Text>
                </FlexLayout>
              ) : (
                <FlexLayout className="items-center gap-2 relative">
                  {hasSubshipments && (
                    <Box
                      className="absolute -left-6 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        row.toggleExpanded();
                      }}
                    >
                      <Icon
                        className={clsx(isExpanded && 'rotate-90')}
                        color="text-dark-500 dark:text-light-300 "
                        icon="ChevronRightIcon"
                        size="m"
                      />
                    </Box>
                  )}
                  <FlexLayout className="flex-col items-center">
                    <FlexLayout className="items-center gap-1">
                      <Text variant="text-xs-medium">{shipment.orderNumber}</Text>
                      <ReferenceNumberTooltip cargoReference={shipment.cargoReference} />
                    </FlexLayout>
                    <WarningTooltip
                      isDriverMissing={isDriverMissing}
                      isNotSentToDriver={isNotSentToDriver}
                      isVehicleMissing={isVehicleMissing}
                    />
                  </FlexLayout>
                </FlexLayout>
              )}
            </FlexLayout>
          );
        },
      }),
      columnHelper.display({
        header: 'Klijent',
        enableSorting: false,
        cell: (props) => {
          const { clientId, transportContractorId } = props.row.original;
          const client = clients.find((c) => c.id === clientId);
          const contractor = contractors.find((c) => c.id === transportContractorId) || tenant;

          return (
            <FlexLayout className="flex-col pr-4 py-2 max-w-[15vw] whitespace-nowrap">
              <Text className="overflow-hidden text-ellipsis" color="text-color-1" variant="text-m-bold">
                {client ? client.name : '—'}
              </Text>
              <Text className="overflow-hidden text-ellipsis" color="text-color-3" variant="text-xs">
                {contractor ? contractor.name : '—'}
              </Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.accessor('price', {
        header: () => (
          <FlexLayout
            className="items-center gap-1 cursor-pointer select-none hover:text-teal-500"
            onClick={() => toggleSort(SortFieldEnum.Price)}
          >
            <Text className="whitespace-nowrap" variant="text-s-medium">
              Cijena
            </Text>
            <DisplayIf condition={isFieldSorted(SortFieldEnum.Price) && !!getSortDirection(SortFieldEnum.Price)}>
              {getSortDirection(SortFieldEnum.Price) === 'desc' ? ' ↓' : ' ↑'}
            </DisplayIf>
          </FlexLayout>
        ),
        enableSorting: false,
        cell: (info) => (
          <FlexLayout className="items-center py-2">
            <Text className="text-green-500 dark:text-green-400" variant="text-m-medium">
              {info.getValue()}€
            </Text>
          </FlexLayout>
        ),
      }),
      columnHelper.display({
        id: 'loadingDates',
        header: () => (
          <FlexLayout
            className="items-center gap-1 cursor-pointer select-none hover:text-teal-500"
            onClick={() => toggleSort(SortFieldEnum.LoadingDate)}
          >
            <Text className="whitespace-nowrap" variant="text-s-medium">
              Datumi utovara
            </Text>
            <DisplayIf
              condition={isFieldSorted(SortFieldEnum.LoadingDate) && !!getSortDirection(SortFieldEnum.LoadingDate)}
            >
              {getSortDirection(SortFieldEnum.LoadingDate) === 'desc' ? ' ↓' : ' ↑'}
            </DisplayIf>
          </FlexLayout>
        ),
        enableSorting: false,
        cell: (props) => {
          const shipment = props.row.original;
          const loadingDates = shipment.cargo.map((c) => c.loadingDate);

          const dates = uniq(loadingDates).sort();
          const isMultipleDates = dates.length > 1;

          return (
            <FlexLayout as="ul" className={clsx('flex-col gap-1 justify-center py-2', isMultipleDates && 'list-disc')}>
              {dates.map((date) => (
                <Text as="li" color="text-color-3" key={date} variant="text-s">
                  {getDataPointDateString(date)}
                </Text>
              ))}
            </FlexLayout>
          );
        },
      }),
      columnHelper.display({
        id: 'unloadingDates',
        header: () => (
          <FlexLayout
            className="items-center gap-1 cursor-pointer select-none hover:text-teal-500"
            onClick={() => toggleSort(SortFieldEnum.UnloadingDate)}
          >
            <Text className="whitespace-nowrap" variant="text-s-medium">
              Datumi istovara
            </Text>
            <DisplayIf
              condition={isFieldSorted(SortFieldEnum.UnloadingDate) && !!getSortDirection(SortFieldEnum.UnloadingDate)}
            >
              {getSortDirection(SortFieldEnum.UnloadingDate) === 'desc' ? ' ↓' : ' ↑'}
            </DisplayIf>
          </FlexLayout>
        ),
        enableSorting: false,
        cell: (props) => {
          const shipment = props.row.original;
          const unloadingDates = shipment.cargo.map((c) => c.unloadingDate);

          const dates = uniq(unloadingDates).sort();
          const isMultipleDates = dates.length > 1;

          return (
            <FlexLayout as="ul" className={clsx('flex-col gap-1 justify-center py-2', isMultipleDates && 'list-disc')}>
              {dates.map((date) => (
                <Text as="li" color="text-color-3" key={date} variant="text-s">
                  {getDataPointDateString(date)}
                </Text>
              ))}
            </FlexLayout>
          );
        },
      }),
      columnHelper.display({
        id: 'ldm',
        enableSorting: false,
        header: 'LDM / Težina',
        size: 100,
        cell: (props) => {
          const { cargo } = props.row.original;

          const ldmTotal = cargo.reduce((acc, c) => (acc += c.ldm), 0);
          const weightTotal = cargo.reduce((acc, c) => (acc += c.weight), 0);

          return (
            <FlexLayout className="flex-col py-2">
              <Text color="text-color-2" variant="text-s-medium">
                {roundLdmValue(ldmTotal) || '—'}
              </Text>
              <Text color="text-color-3" variant="text-xs">
                {weightTotal ? `${weightTotal} kg` : '—'}
              </Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.display({
        id: 'palleteNo',
        size: 100,
        enableSorting: false,
        header: 'Broj paleta',
        cell: (props) => {
          const { cargo } = props.row.original;
          const hasNonstandardCargo = cargo.some((c) => c.metadata?.type === 'nonstandard');

          const palleteNo = cargo.reduce((acc, c) => {
            // For nonstandard cargo, we assume 1 palette per cargo
            const palleteAmount = c.metadata?.palleteAmount || 1;
            return (acc += palleteAmount);
          }, 0);

          return (
            <FlexLayout className="items-center py-2">
              <Text color="text-color-2" variant="text-s-medium">
                {!hasNonstandardCargo && !!palleteNo ? palleteNo : '—'}
              </Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.display({
        id: 'addresses',
        header: 'Adrese utovara i istovara',
        enableSorting: false,
        cell: (props) => {
          const shipment = props.row.original;
          const loadingAddresses = shipment.cargo.map((c) => c.loadingAddress);
          const unloadingAddresses = shipment.cargo.map((c) => c.unloadingAddress);

          return (
            <FlexLayout className="flex-col gap-1 py-2 pr-4 max-w-[240px]">
              <AddressesList addresses={loadingAddresses} icon="ArrowRightEndOnRectangleIcon" />
              <Divider />
              <AddressesList addresses={unloadingAddresses} icon="ArrowRightStartOnRectangleIcon" />
            </FlexLayout>
          );
        },
      }),
      columnHelper.display({
        id: 'vehicle-driver',
        header: 'Vozilo i vozač',
        enableSorting: false,
        cell: (info) => {
          const { vehicleId, driverId } = info.row.original;

          const vehicle = vehicles.find((v) => v.id === vehicleId);
          const driver = employees.find((e) => e.id === driverId);

          const vehicleName = vehicle ? renderVehicleName(vehicle) : '—';
          const driverName = driver?.fullName ?? '—';

          return (
            <FlexLayout className="flex-col gap-2 py-2 w-[150px]">
              <FlexLayout className="items-start gap-1">
                <Icon className="mt-1" icon="TruckIcon" size="s" />
                <Text
                  className="whitespace-nowrap overflow-hidden text-ellipsis"
                  color="text-color-2"
                  title={vehicleName}
                  variant="text-xs"
                >
                  {vehicleName}
                </Text>
              </FlexLayout>
              <FlexLayout className="items-start gap-1">
                <Icon className="mt-1" icon="UserIcon" size="s" />
                <Text
                  className="whitespace-nowrap overflow-hidden text-ellipsis"
                  color="text-color-2"
                  title={driverName}
                  variant="text-xs"
                >
                  {driverName}
                </Text>
              </FlexLayout>
            </FlexLayout>
          );
        },
      }),
      columnHelper.display({
        header: 'Status',
        enableSorting: false,
        cell: (info) => {
          const shipment = info.row.original;
          const cargos = shipment.cargo;

          const statusConfigs = cargos.map((c) => {
            const config = c.loadStatus ? loadStatusConfig[c.loadStatus] : loadStatusConfig[LoadStatus.NotYetLoaded];
            const id = c.id;

            return { ...config, id };
          });

          const isAgencyUse = shipment.isAgencyUse;
          const isSubshipment = !!shipment?.parentShipmentId;

          const shouldRenderAgencyPill = isAgencyUse && !isSubshipment;

          const invoiceConfig = invoiceStatusConfig[shipment.invoiceStatus];

          return (
            <FlexLayout className="flex-col items-end py-2 gap-1">
              {shouldRenderAgencyPill ? (
                <Pill size="s" text="Agencijski nalog" variant="warning" />
              ) : (
                statusConfigs.map((c) => <Pill key={c.id} size="s" text={`📦 ${c.label}`} variant={c.variant} />)
              )}
              <Pill size="s" text={`💰 ${invoiceConfig.label}`} variant={invoiceConfig.variant} />
            </FlexLayout>
          );
        },
      }),
    ];
  }, [clients, contractors, employees, tenant, vehicles, router, toggleSort, isFieldSorted, getSortDirection]);

  const handleRowClick = (shipment: Shipment) => {
    router.push(`/dashboard/shipments/${shipment.id}`);
  };

  const getSubRows = (row: Shipment) => {
    return row.childShipments || [];
  };

  // Add isWarning flag to shipments missing vehicleId or driverId
  const shipmentsWithWarnings = useMemo(() => {
    if (!shipments) return [];

    return shipments.map((shipment) => {
      const isMissingVehicleOrDriver = !shipment.vehicleId || !shipment.driverId;

      function isShipmentComplete(s: Shipment) {
        const isAllCargoUnloaded = s.cargo.every((c) => c.loadStatus === LoadStatus.Unloaded);
        return s.invoiceStatus === InvoiceStatus.Paid && isAllCargoUnloaded;
      }

      const subshipments = shipment.childShipments?.map((s) => {
        return { ...s, isSuccess: isShipmentComplete(s) };
      });

      // Add isWarning flag only to parent shipments
      return {
        ...shipment,
        isWarning: isMissingVehicleOrDriver && shipment.transportContractorId === tenant?.id && !shipment.isAgencyUse,
        isSuccess: isShipmentComplete(shipment),
        subshipments,
      };
    });
  }, [shipments]);

  return <Table columns={columns} data={shipmentsWithWarnings} getSubRows={getSubRows} onRowClick={handleRowClick} />;
}
