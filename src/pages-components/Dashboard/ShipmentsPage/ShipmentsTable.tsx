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
import { getShipmentOverdueInfo } from '@/lib/utils/shipments';
import { renderVehicleName } from '@/lib/utils/vehicles';
import { Box, DisplayIf, Divider, FlexLayout, Icon, Pill, Table, Text, Tooltip } from '@/ui';

import { AddressesList } from './AddressesList';
import { invoiceStatusConfig, loadStatusConfig } from './const';
import { SortFieldEnum, useShipmentsSortLocalStorage } from './hooks';
import { OverdueIndicator } from './OverdueIndicator';
import { ReferenceNumberTooltip } from './ReferenceNumberTooltip';

const columnHelper = createColumnHelper<Shipment>();

interface ShipmentsTableProps {
  shipments?: Shipment[];
  onBeforeNavigate?(): void;
}

export function ShipmentsTable({ shipments, onBeforeNavigate }: ShipmentsTableProps) {
  const router = useRouter();
  const { data: clients = [] } = useClients();
  const { data: contractors = [] } = useContractors();
  const { data: tenant } = useCurrentTenant();
  const { data: vehicles = [] } = useVehicles();
  const { data: employees = [] } = useEmployees();
  const { toggleSort, isFieldSorted, getSortDirection } = useShipmentsSortLocalStorage();

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
          const shipment = props.row.original;
          const { clientId, transportContractorId, documents } = shipment;
          const client = clients.find((c) => c.id === clientId);
          const contractor = contractors.find((c) => c.id === transportContractorId) || tenant;

          const hasDocuments = !!documents?.length;

          const { isOverdue } = getShipmentOverdueInfo({
            invoiceStatus: shipment.invoiceStatus,
            invoiceStatusUpdatedAt: shipment.invoiceStatusUpdatedAt,
            termsOfPayment: client?.termsOfPayment,
          });

          return (
            <FlexLayout className="flex-col pr-4 py-2 max-w-[15vw] whitespace-nowrap">
              <FlexLayout className="gap-4 items-center">
                <Text
                  className={clsx('overflow-hidden text-ellipsis', isOverdue && 'text-orange-500 dark:text-orange-400')}
                  color={isOverdue ? undefined : 'text-color-1'}
                  variant="text-m-bold"
                >
                  {client ? client.name : '—'}
                </Text>
                <OverdueIndicator shipment={shipment} variant="compact" />
                <FlexLayout className="self-baseline mt-1">
                  <DisplayIf condition={hasDocuments}>
                    <Tooltip
                      content={
                        <FlexLayout as="ul" className="flex-col gap-1 px-2 list-disc list-inside">
                          {documents?.map((document) => (
                            <Text as="li" color="text-light-50" key={document.id} variant="text-xs">
                              {document.name}
                            </Text>
                          ))}
                        </FlexLayout>
                      }
                    >
                      <Box>
                        <Icon color="text-color-4" icon="DocumentTextIcon" size="l" type="outline" />
                      </Box>
                    </Tooltip>
                  </DisplayIf>
                </FlexLayout>
              </FlexLayout>
              <Text className="overflow-hidden text-ellipsis" color="text-color-3" variant="text-xs">
                {contractor?.name || '—'}
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
        cell: (info) => {
          const isAgencySubshipment = !!info.row.getParentRow()?.original.isAgencyUse;
          const colorClass = isAgencySubshipment
            ? 'text-red-500 dark:text-red-400'
            : 'text-green-500 dark:text-green-400';

          let value = info.getValue() + '€';

          if (isAgencySubshipment) {
            value = `-${value}`;
          }

          return (
            <FlexLayout className="items-center py-2">
              <Text className={colorClass} variant="text-m-medium">
                {value}
              </Text>
            </FlexLayout>
          );
        },
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

          const ldmTotal = cargo.reduce((acc, c) => (acc += c.ldm || 0), 0);
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
          const { vehicleId, driverId, isAgencyUse } = info.row.original;

          if (isAgencyUse) return null;

          const vehicle = vehicles.find((v) => v.id === vehicleId);
          const driver = employees.find((e) => e.id === driverId);

          const isVehicleMissing = !vehicle;
          const isDriverMissing = !driver;
          const hasMessageChannel = !!driver?.messageChannel;
          const isNotSentToDriver = !info.row.original.sentToDriver && hasMessageChannel;

          const vehicleName = vehicle ? renderVehicleName(vehicle) : 'Vozilo nedodijeljeno';
          const driverName = driver?.fullName ?? 'Vozač nedodijeljen';

          return (
            <FlexLayout className="flex-col gap-2 py-2 w-[150px]">
              <FlexLayout className="items-start gap-1">
                <Icon
                  className="mt-1"
                  color={isVehicleMissing ? 'text-red-500' : undefined}
                  icon="TruckIcon"
                  size="s"
                />
                <Text
                  className="whitespace-nowrap overflow-hidden text-ellipsis"
                  color={isVehicleMissing ? 'text-red-500' : 'text-color-2'}
                  title={vehicleName}
                  variant="text-xs"
                >
                  {vehicleName}
                </Text>
              </FlexLayout>
              {isNotSentToDriver ? (
                <Tooltip
                  content={
                    <Box className="px-2 whitespace-nowrap">
                      <Text color="text-light-50" variant="text-xs">
                        Nalog nije poslan vozaču
                      </Text>
                    </Box>
                  }
                >
                  <FlexLayout className="items-start gap-1">
                    <Icon
                      className="mt-1"
                      color="text-orange-500 dark:text-orange-400"
                      icon="ExclamationTriangleIcon"
                      size="s"
                    />
                    <Text
                      className="whitespace-nowrap overflow-hidden text-ellipsis"
                      color="text-orange-500 dark:text-orange-400"
                      title={driverName}
                      variant="text-xs"
                    >
                      {driverName}
                    </Text>
                  </FlexLayout>
                </Tooltip>
              ) : (
                <FlexLayout className="items-start gap-1">
                  <Icon
                    className="mt-1"
                    color={isDriverMissing ? 'text-red-500' : undefined}
                    icon="UserIcon"
                    size="s"
                  />
                  <Text
                    className="whitespace-nowrap overflow-hidden text-ellipsis"
                    color={isDriverMissing ? 'text-red-500' : 'text-color-2'}
                    title={driverName}
                    variant="text-xs"
                  >
                    {driverName}
                  </Text>
                </FlexLayout>
              )}
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
    onBeforeNavigate?.();
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

  return (
    <Table
      areRowsExpanded
      columns={columns}
      data={shipmentsWithWarnings}
      getSubRows={getSubRows}
      onRowClick={handleRowClick}
    />
  );
}
