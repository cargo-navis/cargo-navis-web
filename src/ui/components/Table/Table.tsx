'use client';

import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import clsx from 'clsx';
import { useState } from 'react';

import { Box, FlexLayout } from '@/ui';

interface TableProps {
  data: any[];
  columns: any[];
  onRowClick?: (row: any) => void;
  getSubRows?: (row: any) => any[];
  areRowsExpanded?: boolean;
}

export const Table: React.FC<TableProps> = ({ data, columns, onRowClick, getSubRows, areRowsExpanded }) => {
  const [sorting, setSorting] = useState([]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, ...(areRowsExpanded && { expanded: true }) },
    enableExpanding: true,
    getSubRows,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: (updater) => setSorting(updater as any),
  });

  return (
    <Box as="table" className="border-collapse w-full table-fixed">
      <Box as="thead" className="bg-dark-200 dark:bg-light-900 sticky top-[-0px] z-10">
        {table.getHeaderGroups().map((headerGroup) => (
          <Box as="tr" key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const meta = header.column.columnDef.meta as { fill?: boolean; width?: string } | undefined;
              const width = meta?.width ?? (meta?.fill ? 'auto' : `${header.getSize()}px`);
              return (
                <th
                  className={clsx(
                    'text-start py-[20px]',
                    header.column.getCanSort() && 'cursor-pointer select-none hover:text-teal-500'
                  )}
                  key={header.id}
                  style={{ width }}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <FlexLayout className="items-center gap-1">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    {{
                      asc: ' ↑',
                      desc: ' ↓',
                    }[header.column.getIsSorted() as string] ?? null}
                  </FlexLayout>
                </th>
              );
            })}
          </Box>
        ))}
      </Box>
      <Box as="tbody">
        {table.getRowModel().rows.map((row, index) => {
          const isSubRow = row.depth > 0;
          const isLast = !table.getRowModel().rows[index + 1] || table.getRowModel().rows[index + 1].depth < row.depth;

          const hasWarning = !isSubRow && row.original && row.original.isWarning === true;
          const isSuccess = row.original && row.original.isSuccess === true;

          return (
            <Box
              as="tr"
              className={clsx(
                'group/row border-b border-b-black-alpha-10 dark:border-b-white-alpha-25 last:border-b-0',
                onRowClick && 'cursor-pointer',
                isSubRow
                  ? 'bg-dark-200 dark:bg-white-alpha-10 hover:bg-black-alpha-05 dark:hover:bg-white-alpha-10'
                  : 'hover:bg-black-alpha-05 dark:hover:bg-white-alpha-10',
                isSubRow && 'relative',
                hasWarning && 'bg-red-50/80 dark:bg-red-800/50 hover:bg-red-100/50 dark:hover:bg-red-800/80',
                isSuccess && 'bg-green-100/80 dark:bg-green-800/50 hover:bg-green-100/50 dark:hover:bg-green-800/80'
              )}
              key={row.id}
              onClick={() => onRowClick?.(row.original)}
            >
              {row.getVisibleCells().map((cell, cellIndex) => (
                <Box
                  as="td"
                  className={clsx(
                    'group/cell relative',
                    isSubRow &&
                      cellIndex === 0 && [
                        !isLast &&
                          'before:absolute before:top-0 before:-left-[22px] before:-bottom-[1px] before:w-[2px] before:bg-dark-300 before:dark:bg-light-700',
                        'after:absolute after:top-0 after:-left-[22px] after:h-1/2 after:w-[9px] after:border-l-[2px] after:border-b-[2px] after:rounded-bl-[6px] after:border-dark-300 after:dark:border-light-700',
                      ]
                  )}
                  key={cell.id}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Box>
              ))}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};
