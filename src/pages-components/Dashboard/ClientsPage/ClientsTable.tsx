import { createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';
import { useMemo } from 'react';

import type { Client } from '@/lib/api';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { getCountryFromCode } from '@/pages-components/Dashboard/NewEmployeePage/const';
import { Box, FlexLayout, Icon, Table, Text } from '@/ui';

const columnHelper = createColumnHelper<Client>();

export function ClientsTable({ clients }: { clients?: Client[] }) {
  const columns = useMemo(() => {
    return [
      columnHelper.display({
        id: 'avatar',
        size: 50,
        cell: (props) => {
          const { name, id } = props.row.original;
          const initials = name[0] + name[1];

          return (
            <Link href={`/dashboard/clients/${id}`}>
              <Box className="py-3 pl-3">
                <FlexLayout className="items-center justify-center w-[50px] h-[50px] rounded-circle bg-teal-900">
                  <Text className="text-light-50 group-hover/cell:text-teal-600 uppercase" variant="text-s-medium">
                    {initials}
                  </Text>
                </FlexLayout>
              </Box>
            </Link>
          );
        },
      }),
      columnHelper.display({
        id: 'name',
        header: 'Ime',
        size: 275,
        cell: (props) => {
          const { name, id } = props.row.original;

          return (
            <Link href={`/dashboard/clients/${id}`}>
              <Box className="py-3">
                <FlexLayout className="flex-col gap-1">
                  <FlexLayout className="gap-3 items-center">
                    <Text className="group-hover/cell:text-teal-600" color="text-color-1" variant="text-m-bold">
                      {name}
                    </Text>
                  </FlexLayout>
                </FlexLayout>
              </Box>
            </Link>
          );
        },
      }),
      columnHelper.display({
        id: 'address',
        header: 'Adresa',
        size: 275,
        cell: (props) => {
          const { address } = props.row.original;
          const country = getCountryFromCode(address.countryCode);

          return (
            <FlexLayout className="items-center gap-2 cursor-pointer text-color-3">
              <FlexLayout className="flex-col">
                <Text variant="text-s">{address.streetName || '–'}</Text>
                <Text variant="text-s">{`${address.placeName}, ${country.name}`}</Text>
              </FlexLayout>
            </FlexLayout>
          );
        },
      }),
      columnHelper.display({
        id: 'varNumber',
        header: 'VAT',
        size: 220,
        cell: (props) => {
          const { vatNumber } = props.row.original;

          return (
            <FlexLayout
              className="items-center gap-2 cursor-pointer text-color-3 hover:text-color-1 transition-colors ease"
              onClick={() => copyToClipboard(vatNumber)}
            >
              <Text variant="text-s">{vatNumber || '–'}</Text>
              <Icon
                className="opacity-0 translate-x-[-4px] group-hover/cell:opacity-100 group-hover/cell:translate-x-0 w-5 transition-transform ease"
                icon="DocumentDuplicateIcon"
              />
            </FlexLayout>
          );
        },
      }),
    ];
  }, []);

  return <Table columns={columns} data={clients || []} />;
}
