import { createColumnHelper } from '@tanstack/react-table';
import clsx from 'clsx';
import uniq from 'lodash/uniq';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

import { type Shipment } from '@/lib/api';
import { InvoiceStatus } from '@/lib/api/shipments';
import { useClients, useContractors, useCurrentTenant, useEmployees, useVehicles } from '@/lib/hooks';
import { getDataPointDateString } from '@/lib/utils/date';
import { roundLdmValue } from '@/lib/utils/math';
import { Box, DisplayIf, FlexLayout, Icon, Pill, Table, Text, Tooltip } from '@/ui';

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
        id: 'loadingDates',
        header: () => (
          <FlexLayout
            className="items-center gap-1 cursor-pointer select-none hover:text-teal-500"
            onClick={() => toggleSort(SortFieldEnum.LoadingReadyDate)}
          >
            <Text className="whitespace-nowrap" variant="text-s-medium">
              Utovar spreman
            </Text>
            <DisplayIf
              condition={
                isFieldSorted(SortFieldEnum.LoadingReadyDate) && !!getSortDirection(SortFieldEnum.LoadingReadyDate)
              }
            >
              {getSortDirection(SortFieldEnum.LoadingReadyDate) === 'desc' ? ' ↓' : ' ↑'}
            </DisplayIf>
          </FlexLayout>
        ),
        enableSorting: false,
        cell: (props) => {
          const shipment = props.row.original;
          const loadingDates = shipment.cargo.map((c) => c.loadingReadyDate);

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
            onClick={() => toggleSort(SortFieldEnum.UnloadingDueDate)}
          >
            <Text className="whitespace-nowrap" variant="text-s-medium">
              Rok istovara
            </Text>
            <DisplayIf
              condition={
                isFieldSorted(SortFieldEnum.UnloadingDueDate) && !!getSortDirection(SortFieldEnum.UnloadingDueDate)
              }
            >
              {getSortDirection(SortFieldEnum.UnloadingDueDate) === 'desc' ? ' ↓' : ' ↑'}
            </DisplayIf>
          </FlexLayout>
        ),
        enableSorting: false,
        cell: (props) => {
          const shipment = props.row.original;
          const unloadingDates = shipment.cargo.map((c) => c.unloadingDueDate);

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
