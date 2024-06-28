'use client';
import clsx from 'clsx';
import { CheckCircleIcon, PencilIcon, TrashIcon, XCircleIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';

import { CategoryLabel } from '@/app/dashboard/employees/CategoryLabel';
import { Box, Table, Text } from '@/ui';
import { Employee } from '@/lib/employees';

import { useCopyPhoneNumber } from './hooks';
import { OccupationPill } from './OccupationPill';

const columnHelper = createColumnHelper<Employee>();

export function EmployeesTable({ employees }: { employees?: Employee[] }) {
  const copyPhoneNumber = useCopyPhoneNumber();

  const columns = useMemo(() => {
    return [
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
      columnHelper.accessor('phoneNumber', {
        header: 'Phone Number',
        cell: props => {
          const phoneNumber = props.getValue();

          return (
            <Box className="flex gap-2">
              <Text color="text-color-2" variant="text-s">{phoneNumber}</Text>
              <DocumentDuplicateIcon className="opacity-0 translate-x-[-4px] group-hover/cell:opacity-100 group-hover/cell:translate-x-0 w-5 cursor-pointer transition-all ease duration-750" onClick={() => copyPhoneNumber(phoneNumber)} />
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
              {licenceCategories.map(l => <CategoryLabel category={l} key={l} />)}
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
            <Box className="invisible group-hover/row:visible flex justify-center gap-4 w-full h-[32px] text-dark-500 dark:text-light-300">
              <PencilIcon className="w-5 cursor-pointer" />
              <TrashIcon className="w-5 cursor-pointer" />
            </Box>
          )
        }
      })
    ];
  }, [copyPhoneNumber]);


  return (
    <Table data={employees} columns={columns} />
  );
}