import { createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';
import { useMemo } from 'react';

import { VehicleAlertTooltip } from '@/components/alerts/VehicleAlertTooltip';
import { type Vehicle, VehicleEnum } from '@/lib/api/vehicles';
import { getDataPointDateString } from '@/lib/utils/date';
import { Box, DisplayIf, FlexLayout, Icon2, Table, Text, Tooltip } from '@/ui';

const columnHelper = createColumnHelper<Vehicle>();

export const TrucksTable = ({ trucks }: { trucks: Vehicle[] }) => {
  const columns = useMemo(() => {
    return [
      columnHelper.display({
        id: 'truck',
        size: 100,
        header: () => <Box className="pl-3">Tegljač</Box>,
        cell: (props) => {
          const { brand, registration, id, documents } = props.row.original;
          const hasDocuments = !!documents?.length;

          return (
            <Link href={`/dashboard/fleet/trucks/${id}`}>
              <FlexLayout className="flex-col py-3 pl-3">
                <FlexLayout className="gap-3 items-center">
                  <Text className="text-color-1 group-hover/cell:text-teal-600" variant="text-m-bold">
                    {registration}
                  </Text>
                  <VehicleAlertTooltip id={id} type={VehicleEnum.TRUCK} />
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
                          <Icon2 color="text-color-4" icon="IconFileDescription" size="l" type="outline" />
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
        header: 'Masa praznog vozila (kg)',
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
        enableSorting: false,
        header: 'Tip motora',
        cell: ({ row }) => {
          const { emissionStandard } = row.original;

          return (
            <FlexLayout>
              <Text className="text-color-2 group-hover/cell:text-teal-600">{emissionStandard}</Text>
            </FlexLayout>
          );
        },
      }),
      columnHelper.accessor((row) => row.tachographExpiryDate, {
        sortUndefined: 'first',
        header: 'Tahograf vrijedi do',
        size: 200,
        cell: (props) => {
          const tachographExpiryDate = props.getValue();
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

  return <Table columns={columns} data={trucks} />;
};
