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
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Box
      as="table"
      className="border-collapse
     w-full
     {/*table-fixed*/}
     "
    >
      <Box as="thead" className="bg-dark-200 dark:bg-light-900 sticky top-[-48px]">
        {table.getHeaderGroups().map((headerGroup) => (
          <Box as="tr" key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th className="text-start py-[20px]" key={header.id} style={{ width: `${header.getSize()}px` }}>
                {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </Box>
        ))}
      </Box>
      <Box as="tbody">
        {table.getRowModel().rows.map((row) => (
          <Box
            as="tr"
            className="group/row hover:bg-black-alpha-05 dark:hover:bg-white-alpha-10 rounded-m border-b border-b-black-alpha-05 last:border-b-0"
            key={row.id}
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
