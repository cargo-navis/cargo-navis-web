import { createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';
import { useMemo } from 'react';

import { VehicleAlertTooltip } from '@/components/alerts/VehicleAlertTooltip';
import { type Vehicle, VehicleEnum } from '@/lib/api/vehicles';
import { Box, FlexLayout, Table, Text } from '@/ui';

const columnHelper = createColumnHelper<Vehicle>();

export const TrailersTable = ({ trailers }: { trailers: Vehicle[] }) => {
  const columns = useMemo(() => {
    return [
      columnHelper.display({
        id: 'trailer',
        size: 100,
        header: () => <Box className="pl-3">Poluprikolica</Box>,
        cell: (props) => {
          const { brand, registration, id } = props.row.original;

          return (
            <Link href={`/dashboard/fleet/trailers/${id}`}>
              <FlexLayout className="flex-col py-3 pl-3">
                <FlexLayout className="gap-3 items-center">
                  <Text className="text-color-1 group-hover/cell:text-teal-600" variant="text-m-bold">
                    {registration}
                  </Text>
                  <VehicleAlertTooltip id={id} type={VehicleEnum.TRAILER} />
                </FlexLayout>
                <Text className="text-color-3 group-hover/cell:text-teal-600">{brand}</Text>
              </FlexLayout>
            </Link>
          );
        },
      }),
      columnHelper.display({
        header: 'Masa prazne poluprikolice (kg)',
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
    ];
  }, []);

  return <Table columns={columns} data={trailers} />;
};
