'use client';
import clsx from 'clsx';
import { CheckCircleIcon, PencilIcon, TrashIcon, XCircleIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';

import { CategoryLabel } from '@/app/dashboard/employees/CategoryLabel';
import { Box, Table, Text } from '@/ui';
import { Employee } from '@/lib/employees';

import { useCopyCellValue } from './hooks';
import { OccupationPill } from './OccupationPill';

const columnHelper = createColumnHelper<Employee>();

export function EmployeesTable({ employees }: { employees?: Employee[] }) {
  const copyCellValue = useCopyCellValue();

  const columns = useMemo(() => {
    return [
      columnHelper.display({
        id: 'avatar',
        size: 100,
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
        size: 275,
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
      columnHelper.accessor('governmentId', {
        header: 'Government ID',
        size: 220,
        cell: props => {
          const governmentId = props.getValue();

          return (
            <Box className="flex gap-2 cursor-pointer text-color-3 hover:text-color-1 transition-colors ease" onClick={() => copyCellValue(governmentId)}>
              <Text variant="text-s">{governmentId}</Text>
              <DocumentDuplicateIcon className="opacity-0 translate-x-[-4px] group-hover/cell:opacity-100 group-hover/cell:translate-x-0 w-5 transition-transform ease" />
            </Box>
          )
        },
      }),
      columnHelper.accessor('phoneNumber', {
        header: 'Phone Number',
        size: 200,
        cell: props => {
          const phoneNumber = props.getValue();

          return (
            <Box className="flex gap-2 cursor-pointer text-color-3 hover:text-color-1 transition-colors ease" onClick={() => copyCellValue(phoneNumber)}>
              <Text variant="text-s">{phoneNumber}</Text>
              <DocumentDuplicateIcon className="opacity-0 translate-x-[-4px] group-hover/cell:opacity-100 group-hover/cell:translate-x-0 w-5 cursor-pointer transition-transform ease" />
            </Box>
          )
        },
      }),
      columnHelper.accessor('driverLicenceCategories', {
        header: 'Categories',
        size: 200,
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
        size: 80,
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
        size: 100,
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
  }, [copyCellValue]);


  return (
    <Table data={employees} columns={columns} />
  );
}