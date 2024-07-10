'use client';

import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

import { Box } from '@/ui';

interface TableProps {
  data: any;
  columns: any;
}


export const Table: React.FC<TableProps> = ({ data, columns }) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  return (
    <Box as="table" className="border-collapse
     w-full
     {/*table-fixed*/}
     ">
      <Box as="thead" className="bg-dark-200 dark:bg-light-900 sticky top-[-48px]">
      {table.getHeaderGroups().map(headerGroup => (
        <Box as="tr" key={headerGroup.id}>
          {headerGroup.headers.map(header => (
            <th key={header.id} className="text-start py-[20px]" style={{ width: `${header.getSize()}px`}}>
              {header.isPlaceholder
                ? null
                : flexRender(
                  header.column.columnDef.header,
                  header.getContext()
                )}
            </th>
          ))}
        </Box>
      ))}
      </Box>
      <Box as="tbody">
      {table.getRowModel().rows.map(row => (
        <Box as="tr" key={row.id} className="group/row transition-colors ease-in-out duration-75 hover:bg-black-alpha-05 dark:hover:bg-white-alpha-10 rounded-m border-b border-b-black-alpha-05 last:border-b-0">
          {row.getVisibleCells().map(cell => (
            <Box as="td" key={cell.id} className="group/cell">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </Box>
          ))}
        </Box>
      ))}
      </Box>
    </Box>
  )
};
