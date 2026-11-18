import Link from 'next/link';
import { useMemo, useState } from 'react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { dimmed, LoadingBar } from '@/components/shared/loading';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Vehicle } from '@/lib/api';
import { useDelayedFlag, useVehicles } from '@/lib/hooks';
import { useDispatchers } from '@/lib/hooks/api';
import { useVehicleStopsByVehicle } from '@/lib/hooks/api/vehicleStops';
import { Icon } from '@/ui';

import { useVehicleStopsFiltersLocalStorage } from './hooks/useVehicleStopsFiltersLocalStorage';
import { buildRoutes, matchesSearch } from './routes';
import { StatusTable } from './StatusTable';
import { useEmployeeNames } from './StopLine';
import { TodayTimelines } from './TodayTimelines';
import { WeekBoard } from './WeekBoard';

/**
 * Stops per vehicle the list asks for (newest first). Today's list asked for 5; the week board and the „Plan” / „Treba
 * pažnju” counts need more of the route.
 */
const STOPS_PER_VEHICLE = 20;

const VIEWS = ['table', 'week', 'today'] as const;
type View = (typeof VIEWS)[number];
const isView = (value: string | undefined): value is View => VIEWS.includes(value as View);

/**
 * Prijevozi (DECISIONS §5, lab /transports): one row per vehicle, three views of the same data behind a segmented
 * switch — Tablica (default), Tjedan, Kao danas. Search by driver / registration, Disponent filter; the filter and the
 * view are remembered in this browser.
 */
export const VehicleStopsPage = () => {
  const {
    data: groups,
    isLoading: isLoadingStops,
    isFetching,
    isError,
    refetch,
  } = useVehicleStopsByVehicle(STOPS_PER_VEHICLE);
  const { data: vehicles, isLoading: isLoadingVehicles } = useVehicles();
  const { data: dispatchers } = useDispatchers();
  const employeeNames = useEmployeeNames();

  const [search, setSearch] = useState('');
  const { storage, updateField } = useVehicleStopsFiltersLocalStorage();
  const dispatcherId = storage.dispatcherId;
  const view: View = isView(storage.view) ? storage.view : 'table';

  const vehicleMap = useMemo(() => new Map<string, Vehicle>((vehicles ?? []).map((v) => [v.id, v])), [vehicles]);
  const routes = useMemo(() => buildRoutes(groups ?? [], vehicleMap), [groups, vehicleMap]);
  const driverName = (id: string | null) => (id ? employeeNames.get(id) : undefined);

  const filtered = useMemo(
    () =>
      routes
        .filter((route) => !dispatcherId || route.stops.some((stop) => stop.disponentId === dispatcherId))
        .filter((route) => matchesSearch(route, search, (id) => employeeNames.get(id))),
    [routes, dispatcherId, search, employeeNames]
  );

  const isLoading = isLoadingStops || isLoadingVehicles;
  const showFetching = useDelayedFlag(isFetching && !isLoading);
  const hasFilters = !!search.trim() || !!dispatcherId;

  function clearFilters() {
    setSearch('');
    updateField('dispatcherId', undefined);
  }

  const empty = isError ? (
    <Empty className="min-h-80">
      <EmptyHeader>
        <EmptyMedia variant="danger">
          <Icon icon="IconAlertTriangle" size="m" />
        </EmptyMedia>
        <EmptyTitle>Prijevozi se nisu učitali</EmptyTitle>
        <EmptyDescription>Provjerite vezu i pokušajte ponovno.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={() => void refetch()}>
          <Icon data-icon="inline-start" icon="IconRefresh" size="s" />
          Pokušaj ponovno
        </Button>
      </EmptyContent>
    </Empty>
  ) : hasFilters ? (
    <Empty className="min-h-80">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon icon="IconSearch" size="m" />
        </EmptyMedia>
        <EmptyTitle>
          {search.trim() ? `Nema rezultata za „${search.trim()}”` : 'Nema prijevoza za ove filtere'}
        </EmptyTitle>
        <EmptyDescription>Pokušajte s drugom registracijom, vozačem ili disponentom.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={clearFilters}>
          Očisti filtere
        </Button>
      </EmptyContent>
    </Empty>
  ) : (
    <Empty className="min-h-80">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon icon="IconTruck" size="m" />
        </EmptyMedia>
        <EmptyTitle>Još nema prijevoza</EmptyTitle>
        <EmptyDescription>Prijevoz nastaje kad nalogu dodijelite vozilo.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button nativeButton={false} render={<Link href="/dashboard/shipments" />} variant="outline">
          Otvori naloge
        </Button>
      </EmptyContent>
    </Empty>
  );

  return (
    <DashboardLayout>
      <PageTitle title="Prijevozi" />
      <div className="flex flex-col gap-4">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Prijevozi</h1>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <InputGroup className="w-full sm:w-72">
              <InputGroupAddon>
                <Icon icon="IconSearch" size="s" />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Pretraži prijevoze"
                placeholder="Vozač ili registracija…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              {search && (
                <InputGroupAddon align="inline-end">
                  <InputGroupButton aria-label="Obriši pretragu" size="icon-xs" onClick={() => setSearch('')}>
                    <Icon icon="IconX" size="xs" />
                  </InputGroupButton>
                </InputGroupAddon>
              )}
            </InputGroup>
            <NativeSelect
              aria-label="Disponent"
              className="w-full sm:w-52"
              value={dispatcherId ?? ''}
              onChange={(event) => updateField('dispatcherId', event.target.value || undefined)}
            >
              <NativeSelectOption value="">Svi disponenti</NativeSelectOption>
              {dispatchers?.map((dispatcher) => (
                <NativeSelectOption key={dispatcher.id} value={dispatcher.id}>
                  {dispatcher.fullName}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          {/* A view switch (same data, different look) = segmented tabs. Remembered per browser. */}
          <Tabs value={view} onValueChange={(value) => updateField('view', value as View)}>
            <TabsList>
              <TabsTrigger value="table">Tablica</TabsTrigger>
              <TabsTrigger value="week">Tjedan</TabsTrigger>
              <TabsTrigger value="today">Kao danas</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading ? (
          <ListSkeleton />
        ) : view === 'table' ? (
          <StatusTable
            bodyClassName={dimmed(showFetching)}
            driverName={driverName}
            empty={empty}
            routes={filtered}
            showFetching={showFetching}
          />
        ) : (
          <div className="relative">
            {showFetching && <LoadingBar className="z-10 rounded-t-xl" />}
            {view === 'week' ? (
              <WeekBoard className={dimmed(showFetching)} driverName={driverName} empty={empty} routes={filtered} />
            ) : (
              <TodayTimelines
                className={dimmed(showFetching)}
                driverName={driverName}
                empty={empty}
                routes={filtered}
              />
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

/** First load: table-shaped rows. */
function ListSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="h-10 border-b bg-muted" />
      {Array.from({ length: 6 }).map((_, index) => (
        <div className="grid grid-cols-5 gap-6 border-b px-3 py-4 last:border-0" key={index}>
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-20" />
          </div>
          {Array.from({ length: 3 }).map((__, cell) => (
            <div className="flex flex-col gap-1.5" key={cell}>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}
