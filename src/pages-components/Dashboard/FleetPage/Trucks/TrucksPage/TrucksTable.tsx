import { VehicleAlertTooltip } from '@/components/alerts/VehicleAlertTooltip';
import { type Vehicle, VehicleEnum } from '@/lib/api/vehicles.d';
import { getDataPointDateString } from '@/lib/utils/date';
import { Box, FlexLayout, Table, Text } from '@/ui';
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
                <FlexLayout className="gap-3 items-center">
                  <Text className="text-color-1 group-hover/cell:text-teal-600" variant="text-m-bold">
                    {registration}
                  </Text>
                  <VehicleAlertTooltip id={id} type={VehicleEnum.TRUCK} />
                </FlexLayout>
                <Text className="text-color-3 group-hover/cell:text-teal-600">{brand}</Text>
              </FlexLayout>
            </Link>
          );
        },
      }),
      columnHelper.display({
        header: 'Curb Weight (kg)',
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
          const formattedDate = getDataPointDateString(tachographExpiryDate);

          return (
            <FlexLayout>
              <Text className="text-color-2 group-hover/cell:text-teal-600">{formattedDate}</Text>
            </FlexLayout>
          );
        },
      }),
    ];
  }, []);

  return <Table data={trucks} columns={columns} />;
};
