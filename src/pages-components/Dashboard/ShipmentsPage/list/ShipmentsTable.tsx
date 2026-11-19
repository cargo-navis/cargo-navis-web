/**
 * The Nalozi table (DECISIONS §5 Nalozi, lab /tables shipments-table.tsx): Nalog · Utovar → Istovar (route track) ·
 * Teret · Vozilo / Vozač · Cijena · Status fakture · ⋯. Sticky header under the top bar, top-aligned cells, subtle row
 * tints (missing vehicle / driver red, paid green), row click opens (the quick look sheet where the page passes
 * `onRowOpen`, else the nalog page; ⌘ / Ctrl / middle click = new tab), right-click = the ⋯ menu. States: skeleton
 * rows on the first load, dimmed rows + a bar under the header on a refetch (after 300ms), empty / filtered-empty /
 * error inside the table under its header.
 */

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import { useRouter } from 'next/router';
import * as React from 'react';

import { dimmed, TableLoadingRow } from '@/components/shared/loading';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Shipment } from '@/lib/api';
import { InvoiceStatus } from '@/lib/api/shipments';
import { cn } from '@/lib/utils';
import { Icon } from '@/ui';

import { SortFieldEnum, useShipmentsSortLocalStorage } from '../hooks';
import { shipmentHref } from '../shared/actions';
import { getInvoiceInfo } from '../shared/invoice';
import { InvoiceCell } from '../shared/InvoiceCell';
import { getLatestStop, useLookups } from '../shared/lookups';
import { ROW_TINT } from '../shared/tones';
import { AssignmentCell } from './AssignmentCell';
import { CargoCell, NalogCell, PriceCell } from './cells';
import { RouteTrack } from './RouteTrack';
import { RowContextMenu, RowMenu } from './RowMenu';

export const COLUMN_LABELS: Record<string, string> = {
  shipment: 'Nalog',
  route: 'Utovar → Istovar',
  cargo: 'Teret',
  vehicle: 'Vozilo / Vozač',
  price: 'Cijena',
  status: 'Status fakture',
};

const COLUMN_VISIBILITY_KEY = 'cargo-navis-shipments-columns';

/** Hidden columns are remembered per browser. */
export function useColumnVisibility() {
  const [visibility, setVisibility] = React.useState<VisibilityState>({});
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(COLUMN_VISIBILITY_KEY);
      if (stored) setVisibility(JSON.parse(stored) as VisibilityState);
    } catch {
      // Ignore a broken entry.
    }
  }, []);
  const update = React.useCallback((id: string, visible: boolean) => {
    setVisibility((current) => {
      const next = { ...current, [id]: visible };
      localStorage.setItem(COLUMN_VISIBILITY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);
  return { visibility, update };
}

function SortHeader({
  label,
  field,
  align = 'left',
}: {
  label: string;
  field: SortFieldEnum;
  align?: 'left' | 'right';
}) {
  const { getSortDirection, setSort } = useShipmentsSortLocalStorage();
  const sorted = getSortDirection(field);
  return (
    <Button
      className={cn('-mx-2.5 font-medium', align === 'right' && 'ml-auto flex')}
      size="sm"
      variant="ghost"
      onClick={() => setSort(field, sorted === 'desc' ? 'asc' : 'desc')}
    >
      {label}
      <Icon
        className={cn(!sorted && 'text-muted-foreground/60')}
        data-icon="inline-end"
        icon={sorted === 'asc' ? 'IconArrowUp' : sorted === 'desc' ? 'IconArrowDown' : 'IconArrowsSort'}
        size="s"
      />
    </Button>
  );
}

function useColumns(): ColumnDef<Shipment>[] {
  const { clientsById } = useLookups();
  return React.useMemo(
    () => [
      {
        id: 'shipment',
        header: 'Nalog',
        cell: ({ row }) => (
          <NalogCell
            clientName={row.original.clientId ? clientsById.get(row.original.clientId)?.name : undefined}
            shipment={row.original}
          />
        ),
        size: 220,
      },
      {
        id: 'route',
        header: () => (
          <div className="flex items-center gap-2">
            <SortHeader field={SortFieldEnum.LoadingReadyDate} label="Utovar" />
            <Icon className="size-3.5! text-muted-foreground [&_svg]:size-full!" icon="IconArrowRight" size="xs" />
            <SortHeader field={SortFieldEnum.UnloadingDueDate} label="Istovar" />
          </div>
        ),
        cell: ({ row }) => <RouteTrack cargos={row.original.cargo} />,
      },
      {
        id: 'cargo',
        header: 'Teret',
        cell: ({ row }) => <CargoCell shipment={row.original} />,
        size: 120,
      },
      {
        id: 'vehicle',
        header: 'Vozilo / Vozač',
        cell: ({ row }) => <AssignmentCell shipment={row.original} />,
        size: 150,
      },
      {
        id: 'price',
        header: () => <SortHeader align="right" field={SortFieldEnum.Price} label="Cijena" />,
        cell: ({ row }) => <PriceCell shipment={row.original} />,
        size: 150,
      },
      {
        id: 'status',
        header: 'Status fakture',
        cell: ({ row }) => {
          const shipment = row.original;
          const client = shipment.clientId ? clientsById.get(shipment.clientId) : undefined;
          return <InvoiceCell amount={shipment.price ?? 0} info={getInvoiceInfo(shipment, client)} />;
        },
        size: 140,
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Akcije</span>,
        cell: ({ row }) => <RowMenu shipment={row.original} />,
        enableHiding: false,
        size: 48,
      },
    ],
    [clientsById]
  );
}

const CELL_PADDING = 'py-3';

/**
 * Share of the table width each column grows to on wide screens; its `size` (px) stays the minimum. Without it the
 * route column took all the spare width and utovar, istovar and Teret drifted apart on big screens.
 */
const GROW: Partial<Record<string, number>> = { shipment: 16, cargo: 10, vehicle: 13, price: 8, status: 11 };

/**
 * Width in px from the measured table width: browsers treat calc() / max() with % on table columns as `auto`, so the
 * share can't be left to CSS. The route column has no width, so it takes what's left (`size: 0` can't: getSize()
 * clamps to minSize, 20px).
 */
function columnWidth(id: string, size: number, tableWidth: number) {
  if (id === 'route') return undefined;
  const grow = GROW[id];
  return grow ? Math.max(size, Math.round((grow / 100) * tableWidth)) : size;
}

export type TableState = 'loading' | 'data' | 'empty';

export function ShipmentsTable({
  shipments,
  state,
  showFetching,
  visibility,
  empty,
  tableTopRef,
  selectedId,
  onRowOpen,
}: {
  shipments: Shipment[];
  state: TableState;
  /** Refetch in flight for 300ms+: dim the rows, bar under the header. */
  showFetching: boolean;
  visibility: VisibilityState;
  /** What goes in the table body when there are no rows (filtered-empty / first use / error). */
  empty?: React.ReactNode;
  tableTopRef?: React.Ref<HTMLDivElement>;
  /** The row shown in the quick look. */
  selectedId?: string;
  /** A plain row click: given = quick look, otherwise the nalog page. */
  onRowOpen?(shipment: Shipment): void;
}) {
  const router = useRouter();
  const columns = useColumns();

  const table = useReactTable({
    data: shipments,
    columns,
    state: { columnVisibility: visibility },
    manualSorting: true,
    getRowId: (row) => row.id,
    getCoreRowModel: getCoreRowModel(),
  });
  const columnCount = table.getVisibleLeafColumns().length;
  const { containerRef, overflows, width } = useHorizontalOverflow();

  return (
    // overflow-clip (not hidden / auto) keeps the rounded corners without making a scroll box, so the header can stick.
    // Narrower than the table's minimum (laptops with the sidebar open): it scrolls sideways instead, so ⋯ stays
    // reachable (the header then pins to the table, not the page).
    // `data-quick-look-rows`: a press in here switches the quick look instead of closing it.
    <div className="overflow-clip rounded-xl border" data-quick-look-rows="" ref={tableTopRef}>
      <div ref={containerRef}>
        <Table
          className="min-w-[74rem] table-fixed"
          containerClassName={overflows ? 'overflow-x-auto' : 'overflow-x-clip'}
        >
          <TableHeader
            className={cn(
              // Pinned under the top bar; when the table scrolls sideways it is its own scroll box, so pin to its top.
              'sticky z-10',
              overflows ? 'top-0' : 'top-(--app-header-height,0px)',
              'bg-muted shadow-[inset_0_-1px_0_var(--border)] [&_tr]:border-b-0'
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className="hover:bg-transparent" key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    className={cn(
                      'px-3 text-muted-foreground',
                      (header.id === 'price' || header.id === 'status') && 'text-right'
                    )}
                    key={header.id}
                    style={{ width: columnWidth(header.id, header.getSize(), width) }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
            <TableLoadingRow colSpan={columnCount} show={showFetching} />
          </TableHeader>
          <TableBody className={dimmed(showFetching)}>
            {state === 'loading' &&
              Array.from({ length: 6 }, (_, index) => (
                <TableRow className="hover:bg-transparent" key={index}>
                  {table.getVisibleLeafColumns().map((column) => (
                    <TableCell className={cn('px-3', CELL_PADDING)} key={column.id}>
                      <Skeleton className={cn('h-4', column.id === 'actions' ? 'w-4' : 'w-3/4')} />
                      {column.id !== 'actions' && <Skeleton className="mt-2 h-3 w-1/2" />}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {state === 'empty' && (
              <TableRow className="hover:bg-transparent">
                <TableCell className="whitespace-normal" colSpan={columnCount}>
                  {empty}
                </TableCell>
              </TableRow>
            )}
            {state === 'data' &&
              table.getRowModel().rows.map((row) => {
                const shipment = row.original;
                const latestStop = getLatestStop(shipment);
                const isMissing = !shipment.isAgency && (!latestStop?.vehicleId || !latestStop?.driverId);
                const isSelected = shipment.id === selectedId;
                return (
                  <RowContextMenu key={row.id} shipment={shipment}>
                    <TableRow
                      className={cn(
                        'cursor-pointer data-popup-open:bg-muted/50',
                        isMissing && ROW_TINT.warning,
                        !isMissing && shipment.invoiceStatus === InvoiceStatus.Paid && ROW_TINT.paid,
                        isSelected && 'bg-brand-soft hover:bg-brand-soft'
                      )}
                      onClick={(event) => {
                        // ⌘ / Ctrl / middle click: a new tab, like a link.
                        if (event.metaKey || event.ctrlKey)
                          window.open(shipmentHref(shipment.id), '_blank', 'noopener');
                        else if (onRowOpen) onRowOpen(shipment);
                        else void router.push(shipmentHref(shipment.id));
                      }}
                      onMouseDown={(event) => {
                        if (event.button === 1) {
                          event.preventDefault();
                          window.open(shipmentHref(shipment.id), '_blank', 'noopener');
                        }
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell className={cn('px-3 align-top whitespace-normal', CELL_PADDING)} key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  </RowContextMenu>
                );
              })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/** Whether the table is wider than its box (then it scrolls sideways; otherwise it clips so the header can stick). */
function useHorizontalOverflow() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = React.useState(false);
  const [width, setWidth] = React.useState(0);
  React.useLayoutEffect(() => {
    const container = containerRef.current?.querySelector<HTMLElement>('[data-slot="table-container"]');
    const table = container?.firstElementChild;
    if (!container || !table) return;
    // The table box, not scrollWidth: scrollWidth counts content spilling out of cells (absolutely placed bits), which
    // made a table that fits look like it scrolls.
    const measure = () => {
      setOverflows((table as HTMLElement).offsetWidth > container.clientWidth + 1);
      setWidth(container.clientWidth);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(table);
    return () => observer.disconnect();
  }, []);
  return { containerRef, overflows, width };
}
