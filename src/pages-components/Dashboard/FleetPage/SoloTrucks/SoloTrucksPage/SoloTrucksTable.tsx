import { createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';
import { useMemo } from 'react';

import { VehicleAlertTooltip } from '@/components/alerts/VehicleAlertTooltip';
import { type Vehicle, VehicleEnum } from '@/lib/api/vehicles';
import { Box, DisplayIf, FlexLayout, Icon, Table, Text, Tooltip } from '@/ui';

const columnHelper = createColumnHelper<Vehicle>();

export const SoloTrucksTable = ({ solos }: { solos: Vehicle[] }) => {
  const columns = useMemo(() => {
    return [
      columnHelper.display({
        id: 'solo',
        size: 150,
        header: () => <Box className="pl-3">Solo Kamion</Box>,
        cell: (props) => {
          const { brand, registration, id, documents } = props.row.original;
          const hasDocuments = !!documents?.length;

          return (
            <Link href={`/dashboard/fleet/solo-trucks/${id}`}>
              <FlexLayout className="flex-col py-3 pl-3">
                <FlexLayout className="gap-3 items-center">
                  <Text className="text-color-1 group-hover/cell:text-teal-600" variant="text-m-bold">
                    {registration}
                  </Text>
                  <VehicleAlertTooltip id={id} type={VehicleEnum.SOLO_TRUCK} />
                  <FlexLayout className="self-baseline mt-1">
                    <DisplayIf condition={hasDocuments}>
                      <Tooltip
                        content={
                          <FlexLayout as="ul" className="flex-col gap-1 px-2 list-disc list-inside w-max">
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
                <Text className="text-color-3 group-hover/cell:text-teal-600">{brand}</Text>
              </FlexLayout>
            </Link>
          );
        },
      }),
      columnHelper.display({
        header: 'Masa prazog vozila (kg)',
        cell: ({ row }) => {
          const { emptyWeight } = row.original;

          return (
            <FlexLayout>
              <Text className="text-color-2 group-hover/cell:text-teal-600">{emptyWeight}</Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.accessor('vehicleLoadType', {
        enableSorting: false,
        header: 'Vrsta utovarnog prostora',
        cell: ({ row }) => {
          const { vehicleLoadType } = row.original;

          return (
            <FlexLayout>
              <Text className="text-color-2 group-hover/cell:text-teal-600 capitalize">
                {vehicleLoadType?.split('_').join(' ') || '–'}
              </Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.display({
        header: 'Utovarni kapacitet (kg)',
        size: 200,
        cell: ({ row }) => {
          const { loadCapacity } = row.original;

          return (
            <FlexLayout>
              <Text className="text-color-2 group-hover/cell:text-teal-600">{loadCapacity}</Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.display({
        header: 'Rampa',
        size: 80,
        cell: ({ row }) => {
          const { ramp } = row.original;
          if (ramp === undefined) return '–';

          return ramp ? (
            <Icon className="text-green-600" icon="CheckCircleIcon" size="l" />
          ) : (
            <Icon className="text-red-500" icon="XCircleIcon" size="l" />
          );
        },
      }),
    ];
  }, []);

  return <Table columns={columns} data={solos} />;
};
