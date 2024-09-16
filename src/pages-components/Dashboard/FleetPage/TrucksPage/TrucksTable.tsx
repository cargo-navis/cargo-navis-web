import type { Vehicle } from '@/lib/api/vehicles.d';
import { Box, FlexLayout, Icon, Table, Text } from '@/ui';
import { createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';
import { useMemo } from 'react';

const columnHelper = createColumnHelper<Vehicle>();

export const TrucksTable = ({ trucks }: { trucks: Vehicle[] }) => {
  const columns = useMemo(() => {
    return [
      columnHelper.display({
        id: 'truck',
        size: 100,
        header: () => <Box className="pl-3">Truck</Box>,
        cell: (props) => {
          const { brand, registration, id } = props.row.original;

          return (
            <Link href={`/dashboard/fleet/trucks/${id}`}>
              <FlexLayout className="flex-col py-3 pl-3">
                <Text className="text-color-1 group-hover/cell:text-teal-600" variant="text-m-bold">
                  {registration}
                </Text>
                <Text className="text-color-3 group-hover/cell:text-teal-600">{brand}</Text>
              </FlexLayout>
            </Link>
          );
        },
      }),
      columnHelper.display({
        header: 'Curb Weight',
        cell: ({ row }) => {
          const { emptyWeight } = row.original;

          return (
            <FlexLayout>
              <Text className="text-color-2 group-hover/cell:text-teal-600">{emptyWeight}</Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.accessor('emissionStandard', {
        header: 'Engine Type',
        cell: ({ row }) => {
          const { emissionStandard } = row.original;

          return (
            <FlexLayout>
              <Text className="text-color-2 group-hover/cell:text-teal-600">{emissionStandard}</Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.display({
        header: 'Tachograph Until',
        size: 200,
        cell: ({ row }) => {
          const { tachographExpiryDate } = row.original;
          const formattedDate = new Date(tachographExpiryDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });

          return (
            <FlexLayout>
              <Text className="text-color-2 group-hover/cell:text-teal-600">{formattedDate}</Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.display({
        header: 'Ramp',
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

  return <Table data={trucks} columns={columns} />;
};
