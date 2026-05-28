import { createColumnHelper } from '@tanstack/react-table';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { Fragment, useMemo } from 'react';

import { EmployeeName } from '@/components/employees/EmployeeName';
import { type Shipment } from '@/lib/api';
import { InvoiceStatus } from '@/lib/api/shipments';
import { useClients, useContractors, useCurrentTenant, useVehicles } from '@/lib/hooks';
import { getDataPointDateString } from '@/lib/utils/date';
import { roundLdmValue } from '@/lib/utils/math';
import { Box, DisplayIf, Divider, FlexLayout, Icon, Pill, Table, Text, Tooltip } from '@/ui';

import { AddressItem } from './AddressesList';
import { invoiceStatusConfig } from './const';
import { SortFieldEnum, useShipmentsSortLocalStorage } from './hooks';
import { OverdueIndicator } from './OverdueIndicator';

const columnHelper = createColumnHelper<Shipment>();

export function ShipmentsTable({ shipments }: { shipments?: Shipment[] }) {
  const router = useRouter();
  const { data: clients = [] } = useClients();
  const { data: contractors = [] } = useContractors();
  const { data: tenant } = useCurrentTenant();
  const { data: vehicles = [] } = useVehicles();
  const { toggleSort, isFieldSorted, getSortDirection } = useShipmentsSortLocalStorage();

  const columns = useMemo(() => {
    return [
      columnHelper.display({
        header: 'Nalog',
        meta: { width: '18%' },
        enableSorting: false,
        cell: (props) => {
          const shipment = props.row.original;
          const { clientId, documents, isInvoiceOverdue, orderNumber, internalNote, externalNote } = shipment;
          const hasNotes = !!(internalNote || externalNote);
          const client = clients.find((c) => c.id === clientId);
          const isAgency = (shipment.children?.length ?? 0) > 0;
          const transporter = isAgency
            ? contractors.find((c) => c.id === shipment.children?.[0]?.transportContractorId)
            : undefined;

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
                'flex-col pr-4 py-4 max-w-[16vw] whitespace-nowrap group-hover/row:text-teal-500'
              )}
            >
              {isAgency && <Pill size="s" text="Agencijski nalog" variant="warning" />}
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
                        <Icon color="text-color-4" icon="IconFileDescription" size="l" type="outline" />
                      </Box>
                    </Tooltip>
                  </DisplayIf>
                </FlexLayout>
              </FlexLayout>
              <FlexLayout className={clsx(subtextColor, 'items-center gap-2 group-hover/row:text-inherit')}>
                <Text className="overflow-hidden text-ellipsis" variant="text-xs">
                  {orderNumber}
                </Text>
                <DisplayIf condition={hasNotes}>
                  <Tooltip
                    content={
                      <FlexLayout className="flex-col gap-2 px-1 max-w-[280px]">
                        {internalNote && (
                          <FlexLayout className="flex-col gap-0.5">
                            <Text color="text-light-300" variant="text-xxxs-medium">
                              INTERNA NAPOMENA
                            </Text>
                            <Text color="text-light-50" variant="text-xs">
                              {internalNote}
                            </Text>
                          </FlexLayout>
                        )}
                        {externalNote && (
                          <FlexLayout className="flex-col gap-0.5">
                            <Text color="text-light-300" variant="text-xxxs-medium">
                              EKSTERNA NAPOMENA
                            </Text>
                            <Text color="text-light-50" variant="text-xs">
                              {externalNote}
                            </Text>
                          </FlexLayout>
                        )}
                      </FlexLayout>
                    }
                  >
                    <Box className="shrink-0 leading-none">
                      <Icon icon="IconInfoCircle" size="m" />
                    </Box>
                  </Tooltip>
                </DisplayIf>
              </FlexLayout>
              {isAgency && (
                <FlexLayout className="flex-col mt-2">
                  <Text color="text-color-3" variant="text-xxs-medium">
                    Transporter
                  </Text>
                  <Text className="overflow-hidden text-ellipsis" color="text-color-2" variant="text-s-medium">
                    {transporter?.name ?? '—'}
                  </Text>
                </FlexLayout>
              )}
            </FlexLayout>
          );
        },
      }),
      columnHelper.accessor('price', {
        size: 120,
        header: () => (
          <FlexLayout
            className="w-full justify-center items-center px-4 text-center cursor-pointer select-none hover:text-teal-500"
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
          const price = info.getValue();
          const shipment = info.row.original;
          const childPrice = shipment.children?.[0]?.price;
          const isAgency = childPrice !== undefined;
          const ruc = isAgency ? (price || 0) - childPrice : 0;
          const rucClass = ruc >= 0 ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400';

          return (
            <FlexLayout className="flex-col items-stretch text-right tabular-nums py-2 pl-4 pr-6">
              <Text className="text-green-500 dark:text-green-400" variant="text-m-medium">
                {`${price}€`}
              </Text>
              {isAgency && (
                <>
                  <Text className="text-red-500 dark:text-red-400" variant="text-m-medium">
                    {`-${childPrice}€`}
                  </Text>
                  <Box className="my-2 self-stretch">
                    <Divider />
                  </Box>
                  <Text color="text-color-3" variant="text-xxs-medium">
                    RUC
                  </Text>
                  <Text className={rucClass} variant="text-m-medium">
                    {ruc}€
                  </Text>
                </>
              )}
            </FlexLayout>
          );
        },
      }),
      columnHelper.display({
        id: 'route',
        enableSorting: false,
        meta: { width: 'auto' },
        header: () => (
          <FlexLayout className="items-center px-4 text-center">
            <Text className="whitespace-nowrap" variant="text-s-medium">
              Utovar / Istovar
            </Text>
          </FlexLayout>
        ),
        cell: (props) => {
          const { cargo, vehicleStops } = props.row.original;

          type Stop = NonNullable<typeof vehicleStops>[number];
          const loadingStopByPostal = new Map<string, Stop>();
          const unloadingStopByPostal = new Map<string, Stop>();

          const isLater = (candidate: Stop, existing?: Stop) => {
            if (!existing) return true;
            if (!candidate.date) return false;
            if (!existing.date) return true;
            return candidate.date > existing.date;
          };

          vehicleStops?.forEach((stop) => {
            const postalCodeId = stop.address?.postalCodeId;
            if (!postalCodeId) return;

            if ((stop.loadingCargos?.length ?? 0) > 0 && isLater(stop, loadingStopByPostal.get(postalCodeId))) {
              loadingStopByPostal.set(postalCodeId, stop);
            }
            if ((stop.unloadingCargos?.length ?? 0) > 0 && isLater(stop, unloadingStopByPostal.get(postalCodeId))) {
              unloadingStopByPostal.set(postalCodeId, stop);
            }
          });

          const uniquePairs = new Map<string, (typeof cargo)[number]>();
          cargo.forEach((c) => {
            const key = `${c.loadingAddress?.postalCodeId ?? ''}|${c.unloadingAddress?.postalCodeId ?? ''}`;
            if (!uniquePairs.has(key)) uniquePairs.set(key, c);
          });

          const loadingGroups = new Map<string, (typeof cargo)[number][]>();
          uniquePairs.forEach((c) => {
            const key = c.loadingAddress?.postalCodeId ?? '';
            if (!loadingGroups.has(key)) loadingGroups.set(key, []);
            loadingGroups.get(key)!.push(c);
          });

          return (
            <FlexLayout className="flex-col gap-3 py-2 px-4">
              {Array.from(loadingGroups.values()).map((groupCargos, gi) => (
                <Box
                  className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-x-3 gap-y-2"
                  key={gi}
                  style={{ gridTemplateRows: `repeat(${groupCargos.length}, auto)` }}
                >
                  <Box
                    className="self-center flex flex-col min-w-0"
                    style={{ gridColumn: 1, gridRow: `1 / span ${groupCargos.length}` }}
                  >
                    {(() => {
                      const loadingStop = loadingStopByPostal.get(groupCargos[0].loadingAddress?.postalCodeId ?? '');
                      return (
                        <>
                          <AddressItem
                            address={groupCargos[0].loadingAddress}
                            completedAt={loadingStop?.completedAt}
                            showCompletionStatus
                            type="loading"
                          />
                          {loadingStop?.date && (
                            <Text color="text-color-4" variant="text-xxs">
                              {getDataPointDateString(loadingStop.date)}
                            </Text>
                          )}
                        </>
                      );
                    })()}
                  </Box>
                  {groupCargos.map((c, ci) => (
                    <Fragment key={ci}>
                      <Box className="self-center" style={{ gridColumn: 2, gridRow: ci + 1 }}>
                        <Icon color="text-color-4" icon="IconArrowRight" size="s" />
                      </Box>
                      <Box className="flex flex-col self-center min-w-0" style={{ gridColumn: 3, gridRow: ci + 1 }}>
                        {(() => {
                          const unloadingStop = unloadingStopByPostal.get(c.unloadingAddress?.postalCodeId ?? '');
                          return (
                            <>
                              <AddressItem
                                address={c.unloadingAddress}
                                completedAt={unloadingStop?.completedAt}
                                showCompletionStatus
                                type="unloading"
                              />
                              {unloadingStop?.date && (
                                <Text color="text-color-4" variant="text-xxs">
                                  {getDataPointDateString(unloadingStop.date)}
                                </Text>
                              )}
                            </>
                          );
                        })()}
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
        size: 110,
        cell: (props) => {
          const { cargo } = props.row.original;

          const ldmTotal = cargo.reduce((acc, c) => (acc += c.ldm || 0), 0);
          const weightTotal = cargo.reduce((acc, c) => (acc += c.weight), 0);

          return (
            <FlexLayout className="flex-col py-2 pr-4">
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
        id: 'vehicleDriver',
        meta: { width: '14%' },
        enableSorting: false,
        header: 'Vozilo / Vozač',
        cell: (props) => {
          const shipment = props.row.original;
          const isAgency = (shipment.children?.length ?? 0) > 0;
          const { vehicleStops } = shipment;
          const latestStop = vehicleStops?.[vehicleStops.length - 1];
          const vehicle = latestStop ? vehicles.find((v) => v.id === latestStop.vehicleId) : undefined;
          const driverId = latestStop?.driverId;

          if (isAgency && !vehicle && !driverId) {
            return (
              <FlexLayout className="items-center py-2">
                <Text color="text-color-3" variant="text-s">
                  —
                </Text>
              </FlexLayout>
            );
          }

          const isVehicleMissing = !vehicle;
          const isDriverMissing = !driverId;

          return (
            <FlexLayout className="flex-col py-2 pr-4 min-w-0">
              <FlexLayout className="items-start gap-1 min-w-0">
                <Icon
                  className="mt-1 shrink-0"
                  color={isVehicleMissing ? 'text-red-500' : 'text-color-2'}
                  icon="IconTruck"
                  size="s"
                />
                {vehicle ? (
                  <Text
                    className="block min-w-0 flex-1 truncate"
                    color="text-color-2"
                    title={`${vehicle.registration}${vehicle.brand ? ` (${vehicle.brand})` : ''}`}
                    variant="text-xs"
                  >
                    {vehicle.registration} {!!vehicle?.brand && `(${vehicle.brand})`}
                  </Text>
                ) : (
                  <Text className="block min-w-0 flex-1 truncate" color="text-red-500" variant="text-xs">
                    Vozilo nedodijeljeno
                  </Text>
                )}
              </FlexLayout>
              <FlexLayout className="items-start gap-1 min-w-0">
                <Icon
                  className="mt-1 shrink-0"
                  color={isDriverMissing ? 'text-red-500' : 'text-color-2'}
                  icon="IconSteeringWheel"
                  size="s"
                />
                {driverId ? (
                  <EmployeeName
                    className="block min-w-0 flex-1 truncate"
                    color="text-color-2"
                    id={driverId}
                    variant="text-xxs"
                  />
                ) : (
                  <Text className="block min-w-0 flex-1 truncate" color="text-red-500" variant="text-xxs">
                    Vozač nedodijeljen
                  </Text>
                )}
              </FlexLayout>
            </FlexLayout>
          );
        },
      }),
      columnHelper.display({
        id: 'palleteNo',
        size: 80,
        enableSorting: false,
        header: 'Palete',
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
        enableSorting: false,
        meta: { width: '124px' },
        header: () => (
          <FlexLayout className="grow items-center justify-end pr-3">
            <Text className="whitespace-nowrap" variant="text-s-medium">
              Status Fakture
            </Text>
          </FlexLayout>
        ),
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
  }, [clients, contractors, tenant, vehicles, router, toggleSort, isFieldSorted, getSortDirection]);

  const handleRowClick = (shipment: Shipment) => {
    router.push(`/dashboard/shipments/${shipment.id}`);
  };

  const shipmentsWithWarnings = useMemo(() => {
    if (!shipments) return [];

    return shipments.map((shipment) => {
      function isShipmentComplete(s: Shipment) {
        return s.invoiceStatus === InvoiceStatus.Paid;
      }

      const isAgency = (shipment.children?.length ?? 0) > 0;
      const latestStop = shipment.vehicleStops?.[shipment.vehicleStops.length - 1];
      const isMissingVehicleOrDriver = !latestStop?.vehicleId || !latestStop?.driverId;

      return {
        ...shipment,
        isSuccess: isShipmentComplete(shipment),
        isWarning: !isAgency && isMissingVehicleOrDriver,
      };
    });
  }, [shipments]);

  return <Table areRowsExpanded columns={columns} data={shipmentsWithWarnings} onRowClick={handleRowClick} />;
}
