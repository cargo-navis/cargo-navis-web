'use client';

import { flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import clsx from 'clsx';
import { useState } from 'react';

import { Box, FlexLayout } from '@/ui';

interface TableProps {
  data: any;
  columns: any;
  onRowClick?: (row: any) => void;
}

export const Table: React.FC<TableProps> = ({ data, columns, onRowClick }) => {
  const [sorting, setSorting] = useState([]);
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: (updater) => setSorting(updater as any),
  });

  return (
    <Box as="table" className="border-collapse w-full">
      <Box as="thead" className="bg-dark-200 dark:bg-light-900 sticky top-[-48px]">
        {table.getHeaderGroups().map((headerGroup) => (
          <Box as="tr" key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                className={clsx(
                  'text-start py-[20px]',
                  header.column.getCanSort() && 'cursor-pointer select-none hover:text-teal-500'
                )}
                key={header.id}
                style={{ width: `${header.getSize()}px` }}
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
            ))}
          </Box>
        ))}
      </Box>
      <Box as="tbody">
        {table.getRowModel().rows.map((row) => (
          <Box
            as="tr"
            className={clsx(
              'group/row hover:bg-black-alpha-05 dark:hover:bg-white-alpha-10 rounded-m border-b border-b-black-alpha-05 last:border-b-0',
              onRowClick && 'cursor-pointer'
            )}
            key={row.id}
            onClick={() => onRowClick?.(row.original)}
          >
            {row.getVisibleCells().map((cell) => (
              <Box as="td" className="group/cell" key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
};
