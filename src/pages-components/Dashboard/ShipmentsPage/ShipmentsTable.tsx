import { createColumnHelper } from '@tanstack/react-table';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { type Shipment } from '@/lib/api';
import { InvoiceStatus, LoadStatus } from '@/lib/api/shipments';
import { useClients, useContractors, useCurrentTenant, useEmployees, useVehicles } from '@/lib/hooks';
import { getDataPointDateString } from '@/lib/utils/date';
import { roundLdmValue } from '@/lib/utils/math';
import { renderVehicleName } from '@/lib/utils/vehicles';
import { Box, FlexLayout, Icon, Pill, Table, Text, Tooltip } from '@/ui';

import { getCountryFromCode } from '../NewEmployeePage/const';
import { invoiceStatusConfig, loadStatusConfig } from './const';

const columnHelper = createColumnHelper<Shipment>();

const formatAddress = (address: Shipment['loadingAddress']) => {
  if (!address) return '—';
  return `${address.postalCode} ${address.placeName}, ${address.countryCode}`;
};

export function ShipmentsTable({ shipments }: { shipments?: Shipment[] }) {
  const router = useRouter();
  const { data: clients = [] } = useClients();
  const { data: contractors = [] } = useContractors();
  const { data: tenant } = useCurrentTenant();
  const { data: vehicles = [] } = useVehicles();
  const { data: employees = [] } = useEmployees();

  const columns = useMemo(() => {
    return [
      columnHelper.accessor('orderNumber', {
        header: 'Broj naloga',
        enableSorting: false,
        size: 140,
        cell: (info) => {
          const row = info.row;
          const hasSubshipments = (info.row.original.subshipments?.length ?? 0) > 0;
          const depth = row.depth;
          const isExpanded = row.getIsExpanded();
          const shipment = info.row.original;
          const isSubshipment = depth !== 0;
          const isTenantTransporter = shipment.transportContractorId === tenant?.id;
          const isAgencyUse = shipment.isAgencyUse;
          const isMissingVehicleOrDriver = !shipment.vehicleId || !shipment.driverId;
          const shouldShowWarning = !isSubshipment && isMissingVehicleOrDriver && isTenantTransporter && !isAgencyUse;

          return (
            <FlexLayout className="items-center py-2 group-hover/row:text-teal-500 gap-2">
              {depth > 0 ? (
                <FlexLayout className="items-center gap-2">
                  <Text>{info.getValue()}</Text>
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
                  <Text variant="text-s-medium">{info.getValue()}</Text>
                  {shouldShowWarning && (
                    <Tooltip
                      content={
                        <Box className="px-1">
                          <Text className="whitespace-nowrap" color="text-light-50" variant="text-xs">
                            {!shipment.vehicleId && !shipment.driverId
                              ? 'Vozilo i vozač još nisu dodijeljeni'
                              : !shipment.vehicleId
                                ? 'Vozilo još nije dodijeljeno'
                                : 'Vozač još nije dodijeljen'}
                          </Text>
                        </Box>
                      }
                    >
                      <Icon color="text-red-500" icon="ExclamationTriangleIcon" size="m" />
                    </Tooltip>
                  )}
                </FlexLayout>
              )}
            </FlexLayout>
          );
        },
      }),
      columnHelper.accessor('clientId', {
        header: 'Klijent',
        enableSorting: false,
        cell: (info) => {
          const clientId = info.getValue();
          const client = clients.find((client) => client.id === clientId);

          const isTenant = !client && tenant?.id === clientId;

          if (isTenant) {
            return (
              <FlexLayout className="items-center py-2 group-hover/row:text-teal-500">
                <Text>{tenant?.name}</Text>
              </FlexLayout>
            );
          }

          return (
            <FlexLayout className="items-center py-2 group-hover/row:text-teal-500">
              <Text>{client ? client.name : '—'}</Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.accessor('transportContractorId', {
        header: 'Prijevozik',
        enableSorting: false,
        cell: (info) => {
          const contractorId = info.getValue();
          const contractor =
            (contractorId && contractors.find((contractor) => contractor.id === contractorId)) || tenant;

          return (
            <FlexLayout className="items-center py-2 group-hover/row:text-teal-500">
              <Text>{contractor ? contractor.name : '—'}</Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.accessor('price', {
        header: 'Cijena',
        enableSorting: true,
        sortingFn: 'basic',
        cell: (info) => (
          <FlexLayout className="items-center py-2 group-hover/row:text-teal-500">
            <Text>{info.getValue()}€</Text>
          </FlexLayout>
        ),
      }),
      columnHelper.accessor('loadingDate', {
        header: 'Datum utovara',
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const a = new Date(rowA.original.loadingDate).getTime();
          const b = new Date(rowB.original.loadingDate).getTime();
          return a < b ? -1 : a > b ? 1 : 0;
        },
        cell: (info) => {
          const date = info.getValue();
          return (
            <FlexLayout className="items-center py-2 group-hover/row:text-teal-500">
              <Text>{getDataPointDateString(date)}</Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.accessor('unloadingDate', {
        header: 'Datum istovara',
        enableSorting: true,
        sortingFn: (rowA, rowB) => {
          const a = new Date(rowA.original.unloadingDate).getTime();
          const b = new Date(rowB.original.unloadingDate).getTime();
          return a < b ? -1 : a > b ? 1 : 0;
        },
        cell: (info) => {
          const date = info.getValue();
          return (
            <FlexLayout className="items-center py-2 group-hover/row:text-teal-500">
              <Text>{getDataPointDateString(date)}</Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.display({
        id: 'ldm',
        enableSorting: false,
        header: 'LDM',
        size: 100,
        cell: (props) => {
          const { cargo } = props.row.original;

          const ldmTotal = cargo.reduce((acc, c) => (acc += c.ldm), 0);
          return (
            <FlexLayout className="items-center py-2 group-hover/row:text-teal-500">
              <Text>{roundLdmValue(ldmTotal) || '—'}</Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.display({
        id: 'palleteNo',
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
            <FlexLayout className="items-center py-2 group-hover/row:text-teal-500">
              <Text>{!hasNonstandardCargo && !!palleteNo ? palleteNo : '—'}</Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.accessor((row) => row.cargo.reduce((acc, c) => acc + (c.weight || 0), 0), {
        id: 'weight',
        header: 'Težina',
        enableSorting: true,
        sortingFn: 'basic',
        cell: (props) => {
          const weight = props.getValue();
          return (
            <FlexLayout className="items-center py-2 group-hover/row:text-teal-500">
              <Text>{weight ? `${weight} kg` : '—'}</Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.accessor('loadingAddress', {
        header: 'Adresa utovara',
        enableSorting: false,
        cell: (info) => {
          const address = info.getValue();
          return (
            <FlexLayout className="items-center py-2 pr-4 group-hover/row:text-teal-500">
              <Tooltip
                content={
                  <Box className="px-1">
                    <Text className="whitespace-nowrap" color="text-light-50" variant="text-xs">
                      {address.streetName}
                    </Text>
                    <br />
                    <Text className="whitespace-nowrap" color="text-light-50" variant="text-xs">
                      {address.postalCode}, {address.placeName},
                    </Text>
                    <br />
                    <Text color="text-light-50" variant="text-xs">
                      {getCountryFromCode(address.countryCode)?.name}
                    </Text>
                  </Box>
                }
              >
                <Text variant="text-xs">{formatAddress(address)}</Text>
              </Tooltip>
            </FlexLayout>
          );
        },
      }),
      columnHelper.accessor('unloadingAddress', {
        header: 'Adresa istovara',
        enableSorting: false,
        cell: (info) => {
          const address = info.getValue();
          return (
            <FlexLayout className="items-center py-2 pr-4 group-hover/row:text-teal-500">
              <Tooltip
                content={
                  <Box className="px-1">
                    <Text className="whitespace-nowrap" color="text-light-50" variant="text-xs">
                      {address.streetName}
                    </Text>
                    <br />
                    <Text className="whitespace-nowrap" color="text-light-50" variant="text-xs">
                      {address.postalCode}, {address.placeName},
                    </Text>
                    <br />
                    <Text color="text-light-50" variant="text-xs">
                      {getCountryFromCode(address.countryCode)?.name}
                    </Text>
                  </Box>
                }
              >
                <Text variant="text-xs">{formatAddress(address)}</Text>
              </Tooltip>
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
            <FlexLayout className="flex-col gap-2 py-2 w-[150px] group-hover/row:text-teal-500">
              <FlexLayout className="items-start gap-1">
                <Icon className="mt-1" icon="TruckIcon" size="s" />
                <Text className="whitespace-nowrap overflow-hidden text-ellipsis" title={vehicleName} variant="text-xs">
                  {vehicleName}
                </Text>
              </FlexLayout>
              <FlexLayout className="items-start gap-1">
                <Icon className="mt-1" icon="UserIcon" size="s" />
                <Text className="whitespace-nowrap overflow-hidden text-ellipsis" title={driverName} variant="text-xs">
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
          const status = shipment.loadStatus;
          const config = status ? loadStatusConfig[status] : loadStatusConfig[LoadStatus.NotYetLoaded];

          const isAgencyUse = shipment.isAgencyUse;
          const isSubshipment = !!shipment?.parentShipmentId;

          const shouldRenderAgencyPill = isAgencyUse && !isSubshipment;

          const text = shouldRenderAgencyPill ? 'Agencijski nalog' : config.label;
          const variant = shouldRenderAgencyPill ? 'warning' : config.variant;

          const invoiceConfig = invoiceStatusConfig[shipment.invoiceStatus];

          return (
            <FlexLayout className="flex-col items-end py-2 gap-1 group-hover/row:text-teal-500">
              <Pill size="s" text={`📦 ${text}`} variant={variant} />
              <Pill size="s" text={`💰 ${invoiceConfig.label}`} variant={invoiceConfig.variant} />
            </FlexLayout>
          );
        },
      }),
    ];
  }, [clients, contractors, employees, tenant, vehicles, router]);

  const handleRowClick = (shipment: Shipment) => {
    router.push(`/dashboard/shipments/${shipment.id}`);
  };

  const getSubRows = (row: Shipment) => {
    return row.subshipments || [];
  };

  // Add isWarning flag to shipments missing vehicleId or driverId
  const shipmentsWithWarnings = useMemo(() => {
    if (!shipments) return [];

    return shipments.map((shipment) => {
      const isMissingVehicleOrDriver = !shipment.vehicleId || !shipment.driverId;

      const subshipments = shipment.subshipments?.map((s) => ({
        ...s,
        isSuccess: s.invoiceStatus === InvoiceStatus.Paid && s.loadStatus === LoadStatus.Unloaded,
      }));

      // Add isWarning flag only to parent shipments
      return {
        ...shipment,
        isWarning: isMissingVehicleOrDriver && shipment.transportContractorId === tenant?.id && !shipment.isAgencyUse,
        isSuccess: shipment.invoiceStatus === InvoiceStatus.Paid && shipment.loadStatus === LoadStatus.Unloaded,
        subshipments,
      };
    });
  }, [shipments]);

  return <Table columns={columns} data={shipmentsWithWarnings} getSubRows={getSubRows} onRowClick={handleRowClick} />;
}
