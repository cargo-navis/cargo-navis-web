import { createColumnHelper } from '@tanstack/react-table';
import Link from 'next/link';
import { useMemo } from 'react';

import type { Employee } from '@/lib/api/employees.d';
import { copyToClipboard } from '@/lib/utils/clipboard';
import { Box, Icon, Table, Text } from '@/ui';

import { CategoryLabel } from './CategoryLabel';

import { OccupationPill } from './OccupationPill';

const columnHelper = createColumnHelper<Employee>();

export function EmployeesTable({ employees }: { employees?: Employee[] }) {
  const columns = useMemo(() => {
    return [
      columnHelper.display({
        id: 'avatar',
        size: 100,
        cell: (props) => {
          const memberName: string = props.row.getValue('fullName');
          const [fName, lName] = memberName.split(' ');
          const id = props.row.original.id;

          return (
            <Link href={`/dashboard/employees/${id}`}>
              <Box className="py-3 pl-3">
                <Box className="flex items-center justify-center w-[50px] h-[50px] rounded-circle bg-teal-900">
                  <Text className="text-light-50 group-hover/cell:text-teal-600">{fName[0] + lName[0]}</Text>
                </Box>
              </Box>
            </Link>
          );
        },
      }),
      columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
        id: 'fullName',
        header: 'Name',
        size: 275,
        cell: (props) => {
          const name = props.getValue();
          const { position, id } = props.row.original;

          return (
            <Link href={`/dashboard/employees/${id}`}>
              <Box className="py-3">
                <Box className="flex flex-col gap-1">
                  <Text className="group-hover/cell:text-teal-600" color="text-color-1" variant="text-m-bold">
                    {name}
                  </Text>
                  <OccupationPill occupation={position} text={position} />
                </Box>
              </Box>
            </Link>
          );
        },
      }),
      columnHelper.accessor('governmentId', {
        header: 'Government ID',
        size: 220,
        cell: (props) => {
          const governmentId = props.getValue();

          return (
            <Box
              className="flex items-center gap-2 cursor-pointer text-color-3 hover:text-color-1 transition-colors ease"
              onClick={() => copyToClipboard(governmentId)}
            >
              <Text variant="text-s">{governmentId || '–'}</Text>
              <Icon
                icon="DocumentDuplicateIcon"
                className="opacity-0 translate-x-[-4px] group-hover/cell:opacity-100 group-hover/cell:translate-x-0 w-5 transition-transform ease"
              />
            </Box>
          );
        },
      }),
      columnHelper.accessor('phoneNumber', {
        header: 'Phone Number',
        size: 200,
        cell: (props) => {
          const phoneNumber = props.getValue();

          return (
            <Box
              className="flex items-center gap-2 cursor-pointer text-color-3 hover:text-color-1 transition-colors ease"
              onClick={() => copyToClipboard(phoneNumber)}
            >
              <Text variant="text-s">{phoneNumber}</Text>
              <Icon
                icon="DocumentDuplicateIcon"
                className="opacity-0 translate-x-[-4px] group-hover/cell:opacity-100 group-hover/cell:translate-x-0 w-5 transition-transform ease"
              />
            </Box>
          );
        },
      }),
      columnHelper.accessor('driverLicenceCategories', {
        header: 'Categories',
        size: 200,
        cell: (props) => {
          const licenceCategories = props.getValue();

          if (!licenceCategories || !licenceCategories.length) return '–';

          return (
            <Box className="flex gap-1 align-middle text-color-3">
              {licenceCategories.map((l: string) => (
                <CategoryLabel category={l} key={l} />
              ))}
            </Box>
          );
        },
      }),
      columnHelper.accessor('adr', {
        size: 80,
        cell: (props) => {
          const adr = props.getValue();
          if (adr === undefined) return '–';

          return props.getValue() ? (
            <Icon className="text-green-600" icon="CheckCircleIcon" size="l" />
          ) : (
            <Icon className="text-red-500" icon="XCircleIcon" size="l" />
          );
        },
        header: 'ADR',
      }),
    ];
  }, []);

  return <Table data={employees} columns={columns} />;
}
