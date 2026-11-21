import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
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
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Employee } from '@/lib/api/employees.d';
import { useCurrentUser, useDelayedFlag, useEmployees, useScrollRestoration } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/utils/plural';
import { normalizeSearch } from '@/pages-components/Dashboard/Partners/partners';
import { Icon, type IconType } from '@/ui';

import {
  deadlineCounts,
  employeeEditHref,
  employeeHref,
  fullName,
  hasWhatsApp,
  highestLicenceRank,
  isDriver,
  isOffice,
  POSITION_LABEL,
  POSITION_ORDER,
} from './employees';
import { AppState, DeactivateDialog, EmployeeInitials, InviteDialog, IspraveSummary, LicenceCategories } from './parts';

type Group = 'all' | 'drivers' | 'office';
/** Tab in the URL (DECISIONS §3 Tabs): ?skupina=vozaci | ured. */
const GROUP_PARAM: Record<Group, string | undefined> = { all: undefined, drivers: 'vozaci', office: 'ured' };
const groupFromParam = (value: unknown): Group =>
  value === 'vozaci' ? 'drivers' : value === 'ured' ? 'office' : 'all';

// Sorting: default = the order the API returns (as today); a header sorts, a third click goes back.
type SortKey = 'name' | 'isprave' | 'kategorije' | 'aplikacija';
type Sort = { key: SortKey; dir: 'asc' | 'desc' } | null;

const severity = (employee: Employee) => {
  const { expired, soon } = deadlineCounts(employee);
  return expired * 100 + soon;
};
const COMPARE: Record<SortKey, (a: Employee, b: Employee) => number> = {
  name: (a, b) => a.lastName.localeCompare(b.lastName, 'hr') || a.firstName.localeCompare(b.firstName, 'hr'),
  // ascending = most urgent first (expired, then soon)
  isprave: (a, b) => severity(b) - severity(a),
  kategorije: (a, b) => highestLicenceRank(b) - highestLicenceRank(a),
  aplikacija: (a, b) => Number(hasWhatsApp(b)) - Number(hasWhatsApp(a)),
};

const COLUMNS = 6;
const searchText = (employee: Employee) =>
  normalizeSearch(`${fullName(employee)} ${employee.phoneNumber ?? ''} ${employee.email ?? ''}`);

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
  const icon: IconType = !active ? 'IconSelector' : sort.dir === 'asc' ? 'IconArrowUp' : 'IconArrowDown';
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
        <Icon className={cn('size-3.5! [&_svg]:size-full!', !active && 'opacity-50')} icon={icon} size="s" />
      </button>
    </TableHead>
  );
}

function RowMenu({
  employee,
  context,
  onDeactivate,
  onInvite,
}: {
  employee: Employee;
  context?: boolean;
  onDeactivate(employee: Employee): void;
  onInvite(employee: Employee): void;
}) {
  const router = useRouter();
  const Item = context ? ContextMenuItem : DropdownMenuItem;
  const Separator = context ? ContextMenuSeparator : DropdownMenuSeparator;
  const href = employeeHref(employee.id);
  return (
    <>
      <Item onClick={() => void router.push(href)}>
        <Icon icon="IconExternalLink" size="s" /> Otvori
      </Item>
      {context && (
        <Item render={<a href={href} rel="noopener noreferrer" target="_blank" />}>
          <Icon icon="IconExternalLink" size="s" /> Otvori u novom tabu
        </Item>
      )}
      {!employee.deleted && (
        <Item onClick={() => void router.push(employeeEditHref(employee.id))}>
          <Icon icon="IconPencil" size="s" /> Uredi
        </Item>
      )}
      {isDriver(employee) && !employee.deleted && (
        <Item onClick={() => onInvite(employee)}>
          <Icon icon="IconLink" size="s" /> Pozivnica za aplikaciju
        </Item>
      )}
      {!employee.deleted && (
        <>
          <Separator />
          <Item variant="destructive" onClick={() => onDeactivate(employee)}>
            <Icon icon="IconUserOff" size="s" /> Deaktiviraj
          </Item>
        </>
      )}
    </>
  );
}

function PositionBadges({ employee }: { employee: Employee }) {
  return (
    <span className="flex flex-wrap items-center gap-1">
      {POSITION_ORDER.filter((position) => employee.positions.includes(position)).map((position) => (
        <Badge key={position} look="outline" size="sm">
          {POSITION_LABEL[position]}
        </Badge>
      ))}
      {employee.deleted && (
        <Badge look="dot" size="sm">
          Deaktiviran
        </Badge>
      )}
    </span>
  );
}

/**
 * Zaposlenici (lab /employees „Popis”, DECISIONS §5): small neutral initials, tabs Svi · Vozači · Ured, deactivated
 * hidden behind „Prikaži deaktivirane” (dimmed), columns Kategorije · Isprave · Aplikacija (sortable). First use: you
 * („Ti”) + „Dodaj prve vozače”.
 */
export const EmployeesPage = () => {
  const router = useRouter();
  const { data, isLoading, isError, isFetching, refetch } = useEmployees({ includeDeleted: true });
  const { data: currentUser } = useCurrentUser();
  const [query, setQuery] = React.useState('');
  const [showDeleted, setShowDeleted] = React.useState(false);
  const [sort, setSort] = React.useState<Sort>(null);
  const [toDeactivate, setToDeactivate] = React.useState<Employee | null>(null);
  const [toInvite, setToInvite] = React.useState<Employee | null>(null);
  const showFetching = useDelayedFlag(isFetching && !isLoading);
  const group = groupFromParam(router.query.skupina);
  const all = React.useMemo(() => data ?? [], [data]);
  useScrollRestoration('employees', { isReady: all.length > 0 });

  const active = all.filter((employee) => !employee.deleted);
  const visible = showDeleted ? all : active;
  const needle = normalizeSearch(query);
  const inGroup = (employee: Employee) =>
    group === 'all' || (group === 'drivers' ? isDriver(employee) : isOffice(employee));
  const shown = visible.filter(inGroup).filter((employee) => !needle || searchText(employee).includes(needle));
  if (sort) shown.sort((a, b) => (sort.dir === 'asc' ? 1 : -1) * COMPARE[sort.key](a, b));
  const hiddenMatches = showDeleted
    ? 0
    : all.filter(
        (employee) => employee.deleted && inGroup(employee) && (!needle || searchText(employee).includes(needle))
      ).length;
  const counts = {
    all: visible.length,
    drivers: visible.filter(isDriver).length,
    office: visible.filter(isOffice).length,
  };

  function setGroup(next: Group) {
    const { skupina: _skupina, ...rest } = router.query;
    const param = GROUP_PARAM[next];
    void router.replace({ pathname: router.pathname, query: param ? { ...rest, skupina: param } : rest }, undefined, {
      shallow: true,
    });
  }

  function open(employee: Employee, event: React.MouseEvent) {
    const href = employeeHref(employee.id);
    if (event.metaKey || event.ctrlKey) window.open(href, '_blank', 'noopener');
    else void router.push(href);
  }

  const dialogs = (
    <>
      <DeactivateDialog
        employee={toDeactivate}
        onOpenChange={(open) => {
          if (!open) setToDeactivate(null);
        }}
      />
      <InviteDialog
        employee={toInvite}
        onOpenChange={(open) => {
          if (!open) setToInvite(null);
        }}
      />
    </>
  );

  // First use: only the person who signed up (DECISIONS §5 „Ti” + „Dodaj prve vozače”).
  if (!isLoading && !isError && active.length <= 1 && all.length <= 1) {
    return (
      <DashboardLayout>
        <PageTitle title="Zaposlenici" />
        <FirstUse currentUserId={currentUser?.id} employees={active} />
      </DashboardLayout>
    );
  }

  const row = (employee: Employee) => (
    <TableRow
      className={cn('cursor-pointer', employee.deleted && 'opacity-55')}
      key={employee.id}
      onClick={(event) => open(employee, event)}
    >
      <TableCell className="py-3">
        <div className="flex items-center gap-3">
          <EmployeeInitials employee={employee} />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="flex items-center gap-2">
              <Link
                className="truncate text-[0.9375rem] font-medium outline-none focus-visible:underline"
                href={employeeHref(employee.id)}
                onClick={(event) => event.stopPropagation()}
              >
                {fullName(employee)}
              </Link>
              {currentUser?.id === employee.id && (
                <Badge size="sm" tone="brand">
                  Ti
                </Badge>
              )}
            </span>
            <PositionBadges employee={employee} />
          </div>
        </div>
      </TableCell>
      <TableCell className="py-3">
        <span className="tabular-nums">{employee.phoneNumber || <span className="text-muted-foreground">—</span>}</span>
      </TableCell>
      <TableCell className="py-3">
        <LicenceCategories adr={!!employee.adrExpiryDate} licences={employee.driverLicenceCategories} size="sm" />
      </TableCell>
      <TableCell className="py-3">
        <IspraveSummary employee={employee} />
      </TableCell>
      <TableCell className="py-3">
        <AppState employee={employee} />
      </TableCell>
      <TableCell className="w-12 py-3 text-right" onClick={(event) => event.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button aria-label={`Akcije za ${fullName(employee)}`} size="icon-sm" variant="ghost" />}
          >
            <Icon icon="IconDots" size="s" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <RowMenu employee={employee} onDeactivate={setToDeactivate} onInvite={setToInvite} />
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );

  let body: React.ReactNode;
  if (isLoading) {
    body = Array.from({ length: 8 }, (_, index) => (
      <TableRow className="hover:bg-transparent" key={index}>
        <TableCell className="py-3">
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </TableCell>
        <TableCell className="py-3">
          <Skeleton className="h-4 w-32" />
        </TableCell>
        <TableCell className="py-3">
          <Skeleton className="h-4 w-20" />
        </TableCell>
        <TableCell className="py-3">
          <Skeleton className="h-5 w-24 rounded-full" />
        </TableCell>
        <TableCell className="py-3">
          <Skeleton className="h-4 w-24" />
        </TableCell>
        <TableCell />
      </TableRow>
    ));
  } else if (isError && all.length === 0) {
    body = (
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={COLUMNS}>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="danger">
                <Icon icon="IconAlertTriangle" size="m" />
              </EmptyMedia>
              <EmptyTitle>Popis se nije učitao</EmptyTitle>
              <EmptyDescription>Provjeri vezu i pokušaj ponovno.</EmptyDescription>
            </EmptyHeader>
            <Button variant="outline" onClick={() => void refetch()}>
              <Icon data-icon="inline-start" icon="IconRefresh" size="s" /> Pokušaj ponovno
            </Button>
          </Empty>
        </TableCell>
      </TableRow>
    );
  } else if (shown.length === 0) {
    body = (
      <TableRow className="hover:bg-transparent">
        <TableCell colSpan={COLUMNS}>
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Icon icon="IconSearch" size="m" />
              </EmptyMedia>
              <EmptyTitle>
                {needle ? `Nema rezultata za „${query.trim()}”` : 'Nema zaposlenika u ovoj skupini'}
              </EmptyTitle>
              {hiddenMatches > 0 && (
                <EmptyDescription>
                  {hiddenMatches}{' '}
                  {plural(hiddenMatches, [
                    'deaktivirani zaposlenik odgovara',
                    'deaktivirana zaposlenika odgovaraju',
                    'deaktiviranih zaposlenika odgovara',
                  ])}{' '}
                  {needle ? 'pretrazi.' : 'ovoj skupini.'}
                </EmptyDescription>
              )}
            </EmptyHeader>
            <EmptyContent className="flex-row justify-center">
              {needle && (
                <Button variant="outline" onClick={() => setQuery('')}>
                  <Icon data-icon="inline-start" icon="IconX" size="s" /> Očisti pretragu
                </Button>
              )}
              {hiddenMatches > 0 && (
                <Button variant="ghost" onClick={() => setShowDeleted(true)}>
                  Prikaži deaktivirane
                </Button>
              )}
            </EmptyContent>
          </Empty>
        </TableCell>
      </TableRow>
    );
  } else {
    body = shown.map((employee) => (
      <ContextMenu key={employee.id}>
        <ContextMenuTrigger render={row(employee)} />
        <ContextMenuContent className="w-64">
          <RowMenu context employee={employee} onDeactivate={setToDeactivate} onInvite={setToInvite} />
        </ContextMenuContent>
      </ContextMenu>
    ));
  }

  return (
    <DashboardLayout>
      <PageTitle title="Zaposlenici" />
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-heading text-3xl font-bold tracking-tight">Zaposlenici</h1>
          <Button nativeButton={false} render={<Link href="/dashboard/employees/new" />}>
            <Icon data-icon="inline-start" icon="IconPlus" size="s" /> Dodaj zaposlenika
          </Button>
        </div>
        <Tabs value={group} onValueChange={(value) => setGroup(value as Group)}>
          <TabsList variant="line">
            <TabsTrigger value="all">Svi {!isLoading && <Badge size="sm">{counts.all}</Badge>}</TabsTrigger>
            <TabsTrigger value="drivers">Vozači {!isLoading && <Badge size="sm">{counts.drivers}</Badge>}</TabsTrigger>
            <TabsTrigger value="office">Ured {!isLoading && <Badge size="sm">{counts.office}</Badge>}</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <InputGroup className="max-w-sm">
            <InputGroupAddon>
              <Icon icon="IconSearch" size="s" />
            </InputGroupAddon>
            <InputGroupInput
              aria-label="Pretraži zaposlenike"
              placeholder="Ime, telefon ili email…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {query && (
              <InputGroupAddon align="inline-end">
                <InputGroupButton aria-label="Očisti" size="icon-xs" onClick={() => setQuery('')}>
                  <Icon icon="IconX" size="xs" />
                </InputGroupButton>
              </InputGroupAddon>
            )}
          </InputGroup>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Switch checked={showDeleted} onCheckedChange={setShowDeleted} /> Prikaži deaktivirane
          </label>
        </div>
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted hover:bg-muted">
                <SortHead label="Zaposlenik" sort={sort} sortKey="name" onSort={setSort} />
                <TableHead>Telefon</TableHead>
                <SortHead label="Kategorije" sort={sort} sortKey="kategorije" onSort={setSort} />
                <SortHead label="Isprave" sort={sort} sortKey="isprave" onSort={setSort} />
                <SortHead label="Aplikacija" sort={sort} sortKey="aplikacija" onSort={setSort} />
                <TableHead>
                  <span className="sr-only">Akcije</span>
                </TableHead>
              </TableRow>
              <TableLoadingRow colSpan={COLUMNS} show={showFetching} />
            </TableHeader>
            <TableBody className={dimmed(showFetching)}>{body}</TableBody>
          </Table>
        </div>
      </div>
      {dialogs}
    </DashboardLayout>
  );
};

/**
 * First use (lab /employees `FirstUse`). Zaposlenici is never truly empty — the person who signed up is an employee —
 * so the list shows them („Ti”) and, under it, what to do first.
 */
function FirstUse({ employees, currentUserId }: { employees: Employee[]; currentUserId?: string }) {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Zaposlenici</h1>
        <Button nativeButton={false} render={<Link href="/dashboard/employees/new" />} variant="outline">
          <Icon data-icon="inline-start" icon="IconPlus" size="s" /> Dodaj zaposlenika
        </Button>
      </div>
      {employees.length > 0 && (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted hover:bg-muted">
                <TableHead>Zaposlenik</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow
                  className="cursor-pointer"
                  key={employee.id}
                  onClick={() => void router.push(employeeHref(employee.id))}
                >
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <EmployeeInitials employee={employee} />
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-2 text-[0.9375rem] font-medium">
                          {fullName(employee)}
                          {employee.id === currentUserId && (
                            <Badge size="sm" tone="brand">
                              Ti
                            </Badge>
                          )}
                        </span>
                        <PositionBadges employee={employee} />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 tabular-nums">{employee.phoneNumber}</TableCell>
                  <TableCell className="py-3">{employee.email}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <div className="rounded-xl border border-dashed">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon icon="IconUserPlus" size="m" />
            </EmptyMedia>
            <EmptyTitle>Dodaj prve vozače</EmptyTitle>
            <EmptyDescription>
              Vozači dobivaju naloge u aplikaciji za vozače, a rokovi njihovih isprava (vozačka, tahograf, ADR,
              liječnički…) prate se ovdje. Kolege iz ureda dodaj da se mogu prijaviti u CargoNavis.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center">
            <Button nativeButton={false} render={<Link href="/dashboard/employees/new?pozicija=vozac" />}>
              <Icon data-icon="inline-start" icon="IconPlus" size="s" /> Dodaj vozača
            </Button>
            <Button
              nativeButton={false}
              render={<Link href="/dashboard/employees/new?pozicija=ured" />}
              variant="outline"
            >
              Dodaj nekoga iz ureda
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    </div>
  );
}
