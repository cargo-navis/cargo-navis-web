'use client';
import clsx from 'clsx';
import { CheckCircleIcon, PencilIcon, TrashIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { createColumnHelper } from '@tanstack/react-table';

import { Box, Table, Text } from '@/ui';
import { Employee } from '@/lib/employees';

import { OccupationPill } from './OccupationPill';

const columnHelper = createColumnHelper<Employee>();

export const columns = [
  columnHelper.display({
    id: 'avatar',
    cell: props => {
      const memberName: string = props.row.getValue('fullName');
      const [fName, lName] = memberName.split(' ');

      return (
        <Box className="py-3 pl-3">
          <Box className="flex items-center justify-center w-[50px] h-[50px] rounded-circle bg-teal-900">
            <Text className="text-light-50">{fName[0]+lName[0]}</Text>
          </Box>
        </Box>
      );
    }
  }),
  columnHelper.accessor(row => `${row.firstName} ${row.lastName}`, {
    id: 'fullName',
    header: 'Name',
    cell: props => {
      const name = props.getValue();
      const position = props.row.original.position;

      return (
        <Box className="py-3">
          <Box className="flex flex-col gap-1">
            <Text color="text-color-1" variant="text-m-bold">{name}</Text>
            <OccupationPill occupation={position} text={position} />
          </Box>
        </Box>
      );
    }
  }),
  columnHelper.accessor('email', {
    header: 'Email',
    cell: props => {
      const email = props.getValue();

      return (
        <Box className="flex flex-col gap-1">
          <Text color="text-color-2" variant="text-s">{email}</Text>
        </Box>
      )
    },
  }),
  columnHelper.accessor('driverLicenceCategories', {
    header: 'Categories',
    cell: props => {
      const licenceCategories = props.getValue();

      if(!licenceCategories) return null;

      return (
        <Box className="flex gap-1 align-middle">
          {licenceCategories.map(v => <span className="bg-light-700 px-1" key={v}>{v}</span>)}
        </Box>
      );
    },
  }),
  columnHelper.accessor('adr', {
    cell: props => {
      const adr = props.getValue();
      if(adr === undefined) return;

      const color = adr ? 'text-green-600' : 'text-red-500'

      return (
        <Box className={clsx(color, 'h-[28px] w-[28px]')}>{props.getValue() ? <CheckCircleIcon /> : <XCircleIcon />}</Box>
      );
    },
    header: 'ADR',
  }),
  columnHelper.display({
    id: 'actions',
    cell: () => {
      return (
        <Box className="flex align-middle gap-3 w-[140px] h-[32px] text-teal-400">
          <PencilIcon className="w-6" />
          <TrashIcon className="w-6" />
        </Box>
      )
    }
  })
];

export function EmployeesTable({ employees }: { employees?: Employee[] }) {
  return (
    <Table data={employees} columns={columns} />
  );
}