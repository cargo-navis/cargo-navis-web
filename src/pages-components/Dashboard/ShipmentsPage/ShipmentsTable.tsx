import { createColumnHelper } from '@tanstack/react-table';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { Fragment, useMemo } from 'react';

import { type Shipment } from '@/lib/api';
import { InvoiceStatus } from '@/lib/api/shipments';
import { useClients, useContractors, useCurrentTenant, useEmployees, useVehicles } from '@/lib/hooks';
import { getDataPointDateString } from '@/lib/utils/date';
import { roundLdmValue } from '@/lib/utils/math';
import { Box, DisplayIf, FlexLayout, Icon, Pill, Table, Text, Tooltip } from '@/ui';

import { AddressItem } from './AddressesList';
import { invoiceStatusConfig } from './const';
import { SortFieldEnum, useShipmentsSortLocalStorage } from './hooks';
import { OverdueIndicator } from './OverdueIndicator';
import { ReferenceNumberTooltip } from './ReferenceNumberTooltip';

const columnHelper = createColumnHelper<Shipment>();

export function ShipmentsTable({ shipments }: { shipments?: Shipment[] }) {
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
        header: 'Nalog',
        enableSorting: false,
        cell: (props) => {
          const shipment = props.row.original;
          const { clientId, documents, isInvoiceOverdue, orderNumber, cargoReference } = shipment;
          const client = clients.find((c) => c.id === clientId);

          const hasDocuments = !!documents?.length;

          const textColor = isInvoiceOverdue
            ? 'text-orange-500 dark:text-orange-400'
            : 'text-dark-700 dark:text-light-100';

          const subtextColor = isInvoiceOverdue
            ? 'text-orange-500 dark:text-orange-400'
            : 'text-dark-600 dark:text-light-300';

          return (
            <FlexLayout
              className={clsx(
                textColor,
                'flex-col pr-4 py-5 max-w-[20vw] whitespace-nowrap group-hover/row:text-teal-500'
              )}
            >
              <FlexLayout className="gap-4 items-center">
                <Text className="overflow-hidden text-ellipsis" variant="text-m-bold">
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
              <FlexLayout className={clsx(subtextColor, 'items-center gap-1 group-hover/row:text-inherit')}>
                <Text className="overflow-hidden text-ellipsis" variant="text-xs">
                  {orderNumber}
                </Text>
                <ReferenceNumberTooltip cargoReference={cargoReference} />
              </FlexLayout>
            </FlexLayout>
          );
        },
      }),
      columnHelper.accessor('price', {
        size: 120,
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
          const value = info.getValue() + '€';
          return (
            <FlexLayout className="items-center py-2">
              <Text className="text-green-500 dark:text-green-400" variant="text-m-medium">
                {value}
              </Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.display({
        id: 'route',
        enableSorting: false,
        size: 360,
        header: 'Utovar / Istovar',
        cell: (props) => {
          const { cargo } = props.row.original;

          const uniquePairs = new Map<string, (typeof cargo)[number]>();
          cargo.forEach((c) => {
            const key = `${c.loadingAddress?.id ?? ''}|${c.unloadingAddress?.id ?? ''}`;
            if (!uniquePairs.has(key)) uniquePairs.set(key, c);
          });

          const loadingGroups = new Map<string, (typeof cargo)[number][]>();
          uniquePairs.forEach((c) => {
            const key = c.loadingAddress?.id ?? '';
            if (!loadingGroups.has(key)) loadingGroups.set(key, []);
            loadingGroups.get(key)!.push(c);
          });

          return (
            <FlexLayout className="flex-col gap-3 py-2 pr-6">
              {Array.from(loadingGroups.values()).map((groupCargos, gi) => (
                <Box
                  className="grid grid-cols-[240px_auto_240px] gap-x-2 gap-y-2"
                  key={gi}
                  style={{ gridTemplateRows: `repeat(${groupCargos.length}, auto)` }}
                >
                  <Box
                    className="self-center flex flex-col"
                    style={{ gridColumn: 1, gridRow: `1 / span ${groupCargos.length}` }}
                  >
                    <AddressItem
                      address={groupCargos[0].loadingAddress}
                      textColor="text-color-2"
                      textVariant="text-xs-medium"
                    />
                    <Text color="text-color-4" variant="text-xxs">
                      {getDataPointDateString(groupCargos[0].loadingReadyDate)}
                    </Text>
                  </Box>
                  {groupCargos.map((c, ci) => (
                    <Fragment key={ci}>
                      <Box className="self-center" style={{ gridColumn: 2, gridRow: ci + 1 }}>
                        <Icon color="text-color-4" icon="ArrowRightIcon" size="s" />
                      </Box>
                      <Box className="flex flex-col self-center" style={{ gridColumn: 3, gridRow: ci + 1 }}>
                        <AddressItem
                          address={c.unloadingAddress}
                          textColor="text-color-2"
                          textVariant="text-xs-medium"
                        />
                        <Text color="text-color-4" variant="text-xxs">
                          {getDataPointDateString(c.unloadingDueDate)}
                        </Text>
                      </Box>
                    </Fragment>
                  ))}
                </Box>
              ))}
            </FlexLayout>
          );
        },
      }),
      columnHelper.display({
        id: 'ldm',
        enableSorting: false,
        header: 'LDM / Težina',
        size: 140,
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
        id: 'status',
        header: () => (
          <FlexLayout className="grow items-center justify-end px-3">
            <Text className="whitespace-nowrap" variant="text-s-medium">
              Status Fakture
            </Text>
          </FlexLayout>
        ),
        enableSorting: false,
        cell: (info) => {
          const shipment = info.row.original;
          const invoiceConfig = invoiceStatusConfig[shipment.invoiceStatus];

          return (
            <FlexLayout className="flex-col items-end py-2 gap-1">
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

  // Add isWarning flag to shipments missing vehicleId or driverId
  const shipmentsWithWarnings = useMemo(() => {
    if (!shipments) return [];

    return shipments.map((shipment) => {
      function isShipmentComplete(s: Shipment) {
        // const isAllCargoUnloaded = s.cargo.every((c) => c.loadStatus === LoadStatus.Unloaded);
        return s.invoiceStatus === InvoiceStatus.Paid; //&& isAllCargoUnloaded;
      }

      return {
        ...shipment,
        isSuccess: isShipmentComplete(shipment),
      };
    });
  }, [shipments]);

  return <Table areRowsExpanded columns={columns} data={shipmentsWithWarnings} onRowClick={handleRowClick} />;
}
