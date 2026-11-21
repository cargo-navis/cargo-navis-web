import { useRouter } from 'next/router';
import * as React from 'react';

import { CRUMBS, DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { dimmed, TableLoadingRow } from '@/components/shared/loading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type Vehicle, VehicleEnum } from '@/lib/api';
import { useDelayedFlag, useScrollRestoration, useVehicles } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/utils/plural';
import { Icon } from '@/ui';

import {
  deadlineSeverity,
  euroLabel,
  formatDimensions,
  formatNumber,
  hasNumber,
  loadLabel,
  matchesVehicle,
  newVehicleHref,
  TYPE_OF,
  typeFromSlug,
  TYPES,
  vehicleEditHref,
  vehicleHref,
} from './fleet';
import { DeadlinesCell } from './parts/DeadlinesCell';
import { DeleteVehicleDialog } from './parts/DeleteVehicleDialog';

/**
 * Flota (DECISIONS §5 „Flota”, lab /fleet „Popis”): one page with type tabs Sve · Tegljači · Poluprikolice · Solo
 * kamioni · Kombiji (+ counts) in `?vrsta=<slug>`; replaces Pregled flote and the 4 type pages (old URLs redirect in
 * next.config.mjs). Columns per tab, „Rokovi” (masculine agreement), search over registration (also without spaces),
 * brand and VIN, „Dodaj vozilo ▾”. One GET /api/fleet returns every type; tabs, search and sort run in the browser.
 */

type Tab = 'all' | VehicleEnum;
type SortKey = 'vehicle' | 'rokovi' | 'capacity';
type Sort = { key: SortKey; dir: 'asc' | 'desc' } | null;

const muted = <span className="text-muted-foreground">–</span>;
const numberCell = (value: number | null | undefined) =>
  hasNumber(value) ? <span className="tabular-nums">{formatNumber(value)}</span> : muted;

export const FleetPage = () => {
  const router = useRouter();
  const tab: Tab = typeFromSlug(router.query.vrsta) ?? 'all';
  const [query, setQuery] = React.useState('');
  const [sort, setSort] = React.useState<Sort>(null);
  const [toDelete, setToDelete] = React.useState<Vehicle | null>(null);

  const { data: vehicles, isLoading, isError, isFetching, refetch } = useVehicles();
  const showFetching = useDelayedFlag(isFetching && !isLoading);
  useScrollRestoration('fleet', { isReady: !!vehicles });

  function setTab(next: Tab) {
    const { vrsta: _vrsta, ...rest } = router.query;
    const params = next === 'all' ? rest : { ...rest, vrsta: TYPE_OF[next].slug };
    setSort(null);
    void router.push({ pathname: router.pathname, query: params }, undefined, { shallow: true });
  }

  function open(vehicle: Vehicle, event?: React.MouseEvent) {
    // ⌘ / Ctrl click opens a new tab, like a link.
    if (event && (event.metaKey || event.ctrlKey)) window.open(vehicleHref(vehicle.id), '_blank');
    else void router.push(vehicleHref(vehicle.id));
  }

  const all = vehicles ?? [];
  const inTab = (vehicle: Vehicle) => tab === 'all' || vehicle.type === tab;
  const compare: Record<SortKey, (a: Vehicle, b: Vehicle) => number> = {
    vehicle: (a, b) => (a.registration ?? '').localeCompare(b.registration ?? '', 'hr'),
    rokovi: (a, b) => deadlineSeverity(b) - deadlineSeverity(a),
    capacity: (a, b) => (b.loadCapacity ?? 0) - (a.loadCapacity ?? 0),
  };
  // Default = by registration, as today (useVehicles sorts by it).
  const inThisTab = all.filter(inTab);
  const shown = inThisTab
    .filter((vehicle) => matchesVehicle(vehicle, query))
    .sort((a, b) => (sort ? (sort.dir === 'asc' ? 1 : -1) * compare[sort.key](a, b) : compare.vehicle(a, b)));
  const elsewhere =
    tab === 'all' ? 0 : all.filter((vehicle) => !inTab(vehicle) && matchesVehicle(vehicle, query)).length;
  const columns = columnsFor(tab, sort, setSort);
  const colSpan = columns.length + 2;

  const menuProps = { onOpen: open, onDelete: setToDelete };

  const row = (vehicle: Vehicle) => (
    <TableRow className="cursor-pointer" key={vehicle.id} onClick={(event) => open(vehicle, event)}>
      <TableCell className="py-3">
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-[0.9375rem] font-medium tracking-tight">{vehicle.registration}</span>
          <span className="text-xs text-muted-foreground">
            {[vehicle.brand, vehicle.manufacturingYear || undefined].filter(Boolean).join(' · ') || '–'}
          </span>
        </div>
      </TableCell>
      {columns.map((column) => (
        <TableCell className="py-3" key={column.key}>
          {column.cell(vehicle)}
        </TableCell>
      ))}
      <TableCell className="w-12 py-3 text-right" onClick={(event) => event.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button aria-label={`Akcije za ${vehicle.registration}`} size="icon-sm" variant="ghost" />}
          >
            <Icon icon="IconDots" size="s" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <RowMenu vehicle={vehicle} {...menuProps} />
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );

  let body: React.ReactNode;
  if (isLoading) {
    body = <SkeletonRows colSpan={colSpan} />;
  } else if (isError && !vehicles) {
    body = (
      <EmptyRow colSpan={colSpan}>
        <EmptyHeader>
          <EmptyMedia variant="danger">
            <Icon icon="IconAlertTriangle" size="m" />
          </EmptyMedia>
          <EmptyTitle>Vozila se nisu učitala</EmptyTitle>
          <EmptyDescription>Provjeri vezu i pokušaj ponovno.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={() => void refetch()}>
            <Icon data-icon="inline-start" icon="IconRefresh" size="s" /> Pokušaj ponovno
          </Button>
        </EmptyContent>
      </EmptyRow>
    );
  } else if (inThisTab.length === 0) {
    // First use (of the fleet or of this type): the first action.
    body = (
      <EmptyRow colSpan={colSpan}>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon icon="IconTruck" size="m" />
          </EmptyMedia>
          <EmptyTitle>{tab === 'all' ? 'Još nema vozila' : `Još nema ${TYPE_OF[tab].genitivePlural}`}</EmptyTitle>
          <EmptyDescription>Dodana vozila prikazuju se ovdje, s rokovima koji istječu.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <AddButton tab={tab} />
        </EmptyContent>
      </EmptyRow>
    );
  } else if (shown.length === 0) {
    body = (
      <EmptyRow colSpan={colSpan}>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon icon="IconSearch" size="m" />
          </EmptyMedia>
          <EmptyTitle>Nema rezultata za „{query.trim()}”</EmptyTitle>
          {elsewhere > 0 && (
            <EmptyDescription>
              {elsewhere}{' '}
              {plural(elsewhere, [
                'vozilo druge vrste odgovara',
                'vozila drugih vrsta odgovaraju',
                'vozila drugih vrsta odgovara',
              ])}{' '}
              pretrazi.
            </EmptyDescription>
          )}
        </EmptyHeader>
        <EmptyContent className="flex-row justify-center">
          <Button variant="outline" onClick={() => setQuery('')}>
            <Icon data-icon="inline-start" icon="IconX" size="s" /> Očisti pretragu
          </Button>
          {elsewhere > 0 && (
            <Button variant="ghost" onClick={() => setTab('all')}>
              Traži u svim vozilima
            </Button>
          )}
        </EmptyContent>
      </EmptyRow>
    );
  } else {
    body = shown.map((vehicle) => (
      <ContextMenu key={vehicle.id}>
        <ContextMenuTrigger render={row(vehicle)} />
        <ContextMenuContent className="w-56">
          <RowMenu context vehicle={vehicle} {...menuProps} />
        </ContextMenuContent>
      </ContextMenu>
    ));
  }

  return (
    <DashboardLayout breadcrumbs={[CRUMBS.fleet]}>
      <PageTitle title="Flota" />
      <div className="flex min-w-0 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-heading text-3xl font-bold tracking-tight">Flota</h1>
          <AddButton tab={tab} />
        </div>
        <Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
          <div className="overflow-x-auto">
            <TabsList variant="line">
              <TabsTrigger value="all">Sve {vehicles && <Badge size="sm">{all.length}</Badge>}</TabsTrigger>
              {TYPES.map((info) => (
                <TabsTrigger key={info.type} value={info.type}>
                  {info.plural}{' '}
                  {vehicles && <Badge size="sm">{all.filter((vehicle) => vehicle.type === info.type).length}</Badge>}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
        <InputGroup className="max-w-sm">
          <InputGroupAddon>
            <Icon icon="IconSearch" size="s" />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Pretraži vozila"
            placeholder={
              tab === 'all' ? 'Registracija, marka ili broj šasije…' : `Pretraži ${TYPE_OF[tab].plural.toLowerCase()}…`
            }
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton aria-label="Očisti pretragu" size="icon-xs" onClick={() => setQuery('')}>
                <Icon icon="IconX" size="xs" />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted hover:bg-muted">
                <SortHead
                  label={tab === 'all' ? 'Vozilo' : TYPE_OF[tab].singular}
                  sort={sort}
                  sortKey="vehicle"
                  onSort={setSort}
                />
                {columns.map((column) => (
                  <React.Fragment key={column.key}>{column.head}</React.Fragment>
                ))}
                <TableHead />
              </TableRow>
              <TableLoadingRow colSpan={colSpan} show={showFetching} />
            </TableHeader>
            <TableBody className={dimmed(showFetching)}>{body}</TableBody>
          </Table>
        </div>
      </div>
      <DeleteVehicleDialog vehicle={toDelete} onOpenChange={(isOpen) => !isOpen && setToDelete(null)} />
    </DashboardLayout>
  );
};

// ---------------------------------------------------------------------------------------------------------------------
// Columns
// ---------------------------------------------------------------------------------------------------------------------

interface Column {
  key: string;
  head: React.ReactNode;
  cell(vehicle: Vehicle): React.ReactNode;
}

/** „Sve” = what every type shares; a type tab adds its own. Every deadline goes into „Rokovi”. */
function columnsFor(tab: Tab, sort: Sort, onSort: (sort: Sort) => void): Column[] {
  const rokovi: Column = {
    key: 'rokovi',
    head: <SortHead label="Rokovi" sort={sort} sortKey="rokovi" onSort={onSort} />,
    cell: (vehicle) => <DeadlinesCell vehicle={vehicle} />,
  };
  const type: Column = {
    key: 'type',
    head: <TableHead>Vrsta</TableHead>,
    cell: (vehicle) => <Badge look="outline">{TYPE_OF[vehicle.type]?.singular ?? vehicle.type}</Badge>,
  };
  const loadSpace: Column = {
    key: 'load',
    head: <TableHead>Utovarni prostor</TableHead>,
    cell: (vehicle) => {
      const load = loadLabel(vehicle.vehicleLoadType);
      const capacity = formatNumber(vehicle.loadCapacity);
      if (vehicle.type === VehicleEnum.TRUCK || (!load && !capacity)) return muted;
      return (
        <span>
          {load ?? '–'}
          {capacity && <span className="text-muted-foreground tabular-nums"> · {capacity} kg</span>}
        </span>
      );
    },
  };
  const capacity: Column = {
    key: 'capacity',
    head: <SortHead label="Kapacitet (kg)" sort={sort} sortKey="capacity" onSort={onSort} />,
    cell: (vehicle) => numberCell(vehicle.loadCapacity),
  };
  const loadType: Column = {
    key: 'loadType',
    head: <TableHead>Utovarni prostor</TableHead>,
    cell: (vehicle) => loadLabel(vehicle.vehicleLoadType) ?? muted,
  };
  const emptyWeight: Column = {
    key: 'weight',
    head: <TableHead>Masa praznog vozila (kg)</TableHead>,
    cell: (vehicle) => numberCell(vehicle.emptyWeight),
  };
  const euro: Column = {
    key: 'euro',
    head: <TableHead>Euro norma</TableHead>,
    cell: (vehicle) => euroLabel(vehicle.emissionStandard) ?? muted,
  };
  const power: Column = {
    key: 'power',
    head: <TableHead>Snaga (kW)</TableHead>,
    cell: (vehicle) => numberCell(vehicle.enginePower),
  };
  const dimensions: Column = {
    key: 'dimensions',
    head: <TableHead>D × Š × V (m)</TableHead>,
    cell: (vehicle) => {
      const value = formatDimensions(vehicle);
      return value ? <span className="tabular-nums">{value}</span> : muted;
    },
  };
  const ramp: Column = {
    key: 'ramp',
    head: <TableHead>Rampa</TableHead>,
    cell: (vehicle) => (vehicle.ramp ? 'Da' : <span className="text-muted-foreground">Ne</span>),
  };

  if (tab === VehicleEnum.TRUCK) return [euro, power, emptyWeight, rokovi];
  if (tab === VehicleEnum.TRAILER) return [loadType, capacity, dimensions, rokovi];
  if (tab === VehicleEnum.SOLO_TRUCK || tab === VehicleEnum.VAN) return [loadType, capacity, ramp, euro, rokovi];
  return [type, loadSpace, rokovi];
}

function SortHead({
  label,
  sortKey,
  sort,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  sort: Sort;
  onSort(sort: Sort): void;
}) {
  const active = sort?.key === sortKey;
  const icon = !active ? 'IconSelector' : sort.dir === 'asc' ? 'IconArrowUp' : 'IconArrowDown';
  return (
    <TableHead aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}>
      <button
        className={cn(
          '-ml-1 flex items-center gap-1 rounded-md px-1 py-0.5 hover:bg-accent hover:text-foreground',
          active && 'text-foreground'
        )}
        type="button"
        onClick={() =>
          onSort(!active ? { key: sortKey, dir: 'asc' } : sort.dir === 'asc' ? { key: sortKey, dir: 'desc' } : null)
        }
      >
        {label}
        <Icon className={cn('size-3.5! [&_svg]:size-full!', !active && 'opacity-50')} icon={icon} />
      </button>
    </TableHead>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------------------------------------------------

function RowMenu({
  vehicle,
  context,
  onOpen,
  onDelete,
}: {
  vehicle: Vehicle;
  context?: boolean;
  onOpen(vehicle: Vehicle): void;
  onDelete(vehicle: Vehicle): void;
}) {
  const router = useRouter();
  const Item = context ? ContextMenuItem : DropdownMenuItem;
  const Separator = context ? ContextMenuSeparator : DropdownMenuSeparator;
  return (
    <>
      <Item onClick={() => onOpen(vehicle)}>
        <Icon icon="IconExternalLink" size="s" /> Otvori
      </Item>
      {context && (
        <Item render={<a href={vehicleHref(vehicle.id)} rel="noopener noreferrer" target="_blank" />}>
          <Icon icon="IconExternalLink" size="s" /> Otvori u novom tabu
        </Item>
      )}
      <Item onClick={() => void router.push(vehicleEditHref(vehicle.id))}>
        <Icon icon="IconPencil" size="s" /> Uredi
      </Item>
      <Separator />
      <Item variant="destructive" onClick={() => onDelete(vehicle)}>
        <Icon icon="IconTrash" size="s" /> Obriši
      </Item>
    </>
  );
}

/** A type tab adds that type; on „Sve” the type is the first thing to choose. */
function AddButton({ tab }: { tab: Tab }) {
  const router = useRouter();
  if (tab !== 'all') {
    return (
      <Button onClick={() => void router.push(newVehicleHref(tab))}>
        <Icon data-icon="inline-start" icon="IconPlus" size="s" /> Dodaj {TYPE_OF[tab].accusative}
      </Button>
    );
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button />}>
        <Icon data-icon="inline-start" icon="IconPlus" size="s" /> Dodaj vozilo{' '}
        <Icon data-icon="inline-end" icon="IconChevronDown" size="s" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {TYPES.map((info) => (
          <DropdownMenuItem key={info.type} onClick={() => void router.push(newVehicleHref(info.type))}>
            <Icon icon="IconTruck" size="s" /> {info.singular}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EmptyRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell colSpan={colSpan}>
        <Empty>{children}</Empty>
      </TableCell>
    </TableRow>
  );
}

function SkeletonRows({ colSpan }: { colSpan: number }) {
  return Array.from({ length: 6 }, (_, index) => (
    <TableRow className="hover:bg-transparent" key={index}>
      <TableCell className="py-3">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </TableCell>
      {Array.from({ length: colSpan - 2 }, (__, cell) => (
        <TableCell className="py-3" key={cell}>
          <Skeleton className="h-4 w-20" />
        </TableCell>
      ))}
      <TableCell className="w-12 py-3" />
    </TableRow>
  ));
}
