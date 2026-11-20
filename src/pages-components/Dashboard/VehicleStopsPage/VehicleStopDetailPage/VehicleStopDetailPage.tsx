import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

import { CRUMBS, DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { DriverAvatar } from '@/components/shared/driver-avatar';
import { dimmed, LoadingBar } from '@/components/shared/loading';
import { EntityNotFound, isNotFoundError } from '@/components/shared/not-found';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import type { VehicleStop } from '@/lib/api/vehicleStops';
import { useClients, useDelayedFlag, useVehicles } from '@/lib/hooks';
import { useDeleteVehicleStop, useRearrangeVehicleStop, useVehicleStops } from '@/lib/hooks/api/vehicleStops';
import { cn } from '@/lib/utils';
import { formatDateShort } from '@/lib/utils/date';
import { driverToneClasses } from '@/lib/utils/driverTone';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Icon } from '@/ui';

import { routeFacts } from '../routeFacts';
import { StopDate, StopKinds, useEmployeeNames } from '../StopLine';
import { chronological, isDone, kindWord, placeOnly } from '../stops';
import { DriverChangePopover, DriverHandoverDialog, type DriverScope } from './DriverChange';
import { buildBlocks, buildEntries, type Entry, foldedCount } from './routeEntries';
import { StopCard, type StopCardHandlers } from './StopCard';
import { StopSheet, type StopSheetTarget } from './StopSheet';

/**
 * Ruta of one vehicle (DECISIONS §5 Prijevozi, lab /transports `RouteView`): today's order — newest first — with runs of
 * the same driver drawn as avatar + side bar in the driver's colour (name + „Promijeni”; red dashed „Bez vozača” +
 * „Dodijeli vozača” when none), a „Danas” line, earlier finished ones folded away, cards with inline date edit and a ⋯
 * menu, the stop form in a side sheet. `?highlight=<stopId>` scrolls to a stop and rings it.
 */
export const VehicleStopDetailPage = () => {
  const { query } = useRouter();
  const vehicleId = query.vehicleId as string;
  const highlight = typeof query.highlight === 'string' ? query.highlight : undefined;

  const {
    data,
    error,
    isPending: isLoadingStops,
    isError,
    isFetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useVehicleStops(vehicleId);
  const { data: vehicles, isLoading: isLoadingVehicles } = useVehicles();
  const { data: clients } = useClients();
  const employeeNames = useEmployeeNames();
  const { mutateAsync: deleteStop, isPending: isDeleting } = useDeleteVehicleStop();
  const { mutate: rearrangeStop } = useRearrangeVehicleStop(vehicleId);

  const vehicle = React.useMemo(() => vehicles?.find((item) => item.id === vehicleId), [vehicles, vehicleId]);
  /** Newest first (the API's route order). */
  const stops = React.useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  const [showEarlier, setShowEarlier] = React.useState(false);
  const [sheet, setSheet] = React.useState<StopSheetTarget | null>(null);
  const [toDelete, setToDelete] = React.useState<VehicleStop | null>(null);
  const [handoverFrom, setHandoverFrom] = React.useState<VehicleStop | null>(null);
  const [activeDragId, setActiveDragId] = React.useState<string | null>(null);

  const driverName = React.useCallback(
    (id: string | null) => (id ? employeeNames.get(id) : undefined),
    [employeeNames]
  );
  const clientName = React.useMemo(() => {
    const names = new Map<string, string>();
    clients?.forEach((client) => names.set(client.id.toString(), client.name));
    return (id: string | null) => (id ? names.get(id) : undefined);
  }, [clients]);

  // A highlighted stop among the folded ones unfolds them.
  const folded = foldedCount(stops);
  const highlightFolded =
    !!highlight &&
    chronological(stops)
      .slice(0, folded)
      .some((stop) => stop.id === highlight);
  const showAll = showEarlier || highlightFolded;
  const entries = buildEntries(stops, { showEarlier: showAll });
  const blocks = buildBlocks(entries);
  const visibleStops = entries.flatMap((entry) => (entry.type === 'stop' ? [entry.stop] : []));
  const lastStopId = visibleStops.at(-1)?.id;
  const next = chronological(stops).find((stop) => !isDone(stop));
  const facts = routeFacts(stops);
  const currentTrailerId = (facts.next ?? facts.lastDone)?.trailerId;
  const trailer = currentTrailerId ? vehicles?.find((item) => item.id === currentTrailerId) : undefined;
  const currentDriver = driverName(facts.driverId);

  const isHighlightLoaded = !!highlight && stops.some((stop) => stop.id === highlight);
  // A stop opened by link (/stop/[id], notifications) may sit on an older page: keep loading until it's there.
  React.useEffect(() => {
    if (!highlight || !data || isHighlightLoaded || !hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [highlight, data, isHighlightLoaded, hasNextPage, isFetchingNextPage, fetchNextPage]);
  React.useEffect(() => {
    if (!isHighlightLoaded) return;
    document
      .querySelector(`[data-stop-id="${CSS.escape(highlight as string)}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlight, isHighlightLoaded]);

  // Older pages load as the bottom comes into view (only once the folded ones are shown).
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const canLoadMore = !!hasNextPage && (showAll || folded === 0);
  React.useEffect(() => {
    const element = sentinelRef.current;
    if (!element || !canLoadMore) return;
    const observer = new IntersectionObserver(
      (items) => {
        if (items[0]?.isIntersecting && !isFetchingNextPage) void fetchNextPage();
      },
      { rootMargin: '200px' }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [canLoadMore, isFetchingNextPage, fetchNextPage]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const queryClient = useQueryClient();
  const [isLoadingRoute, setIsLoadingRoute] = React.useState(false);
  /** Loads every older page, so „Svi nezavršeni na ovom vozilu” really is all of them. */
  const loadWholeRoute = React.useCallback(async () => {
    if (!hasNextPage) return;
    setIsLoadingRoute(true);
    try {
      let result = await fetchNextPage();
      while (result.hasNextPage && !result.isError) result = await fetchNextPage();
    } finally {
      setIsLoadingRoute(false);
    }
  }, [hasNextPage, fetchNextPage]);

  const activeDragStop = activeDragId ? stops.find((stop) => stop.id === activeDragId) : undefined;

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = stops.findIndex((stop) => stop.id === active.id);
    const newIndex = stops.findIndex((stop) => stop.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(stops, oldIndex, newIndex);
    // Newest first: the stop after it in the list is the one before it on the route.
    const previousStopId = reordered[newIndex + 1]?.id ?? null;
    rearrangeStop(
      { stopId: active.id as string, previousStopId },
      {
        onSuccess: () => {
          showSuccessToast({ title: 'Premješteno' });
          // The neighbours' previousStopId changed too: reload the route.
          void queryClient.invalidateQueries({ queryKey: ['vehicleStops', 'paginated', vehicleId] });
        },
        onError: (error) => {
          const code = (error as AxiosError<{ errorCode?: string }>)?.response?.data?.errorCode;
          if (code === 'INVALID_STOP_POSITION') {
            showErrorToast({
              title: 'Ovdje se ne može premjestiti',
              description: 'Utovari i istovari premještaju se samo unutar istog datuma ili među onima bez datuma.',
            });
            return;
          }
          showErrorToast({ title: 'Premještanje nije uspjelo. Pokušajte ponovno.' });
        },
      }
    );
  }

  /** „Dodaj prije”: after the stop before it — taken from the loaded route (fresh), else from the stop itself. */
  function insertBefore(stop: VehicleStop): StopSheetTarget {
    const index = stops.findIndex((item) => item.id === stop.id);
    const older = index >= 0 ? stops[index + 1] : undefined;
    if (older) return { mode: 'new', previousStopId: older.id, previousStop: older };
    if (index === stops.length - 1 && !hasNextPage) return { mode: 'new', previousStopId: null };
    return { mode: 'new', previousStopId: stop.previousStopId };
  }

  const handlers: StopCardHandlers = {
    onEdit: (stop) => setSheet({ mode: 'edit', stop }),
    onInsert: (stop, where) =>
      setSheet(where === 'after' ? { mode: 'new', previousStopId: stop.id, previousStop: stop } : insertBefore(stop)),
    onDelete: setToDelete,
    onChangeDriverFrom: setHandoverFrom,
  };

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await deleteStop(toDelete.id);
      showSuccessToast({ title: 'Obrisano' });
      setToDelete(null);
    } catch {
      showErrorToast({ title: 'Brisanje nije uspjelo. Pokušajte ponovno.' });
    }
  }

  const isLoading = isLoadingStops || isLoadingVehicles;
  const showFetching = useDelayedFlag(isFetching && !isLoading && !isFetchingNextPage);

  if (isLoading) {
    return (
      <DashboardLayout>
        <RouteSkeleton />
      </DashboardLayout>
    );
  }

  // The vehicles list has no such vehicle (deleted from the fleet), or the route itself answers 404.
  if ((vehicles && !vehicle && !isError) || isNotFoundError(error)) {
    return (
      <DashboardLayout>
        <EntityNotFound kind="vehicle" />
      </DashboardLayout>
    );
  }

  if (!vehicle || isError) {
    return (
      <DashboardLayout>
        <BackLink />
        <Empty className="min-h-80">
          <EmptyHeader>
            <EmptyMedia variant="danger">
              <Icon icon="IconAlertTriangle" size="m" />
            </EmptyMedia>
            <EmptyTitle>Ruta se nije učitala</EmptyTitle>
            <EmptyDescription>Provjerite vezu i pokušajte ponovno.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" onClick={() => void refetch()}>
              <Icon data-icon="inline-start" icon="IconRefresh" size="s" />
              Pokušaj ponovno
            </Button>
          </EmptyContent>
        </Empty>
      </DashboardLayout>
    );
  }

  const openNew = () => setSheet({ mode: 'new', previousStopId: stops[0]?.id ?? null, previousStop: stops[0] });

  const renderEntry = (entry: Entry) => {
    if (entry.type === 'earlier') {
      return (
        <li className="pb-3 pl-11" key="earlier">
          <Button size="sm" variant="ghost" onClick={() => setShowEarlier(true)}>
            Prikaži ranije ({entry.count})
          </Button>
        </li>
      );
    }
    if (entry.type === 'today') {
      return (
        <li className="flex items-center gap-2 py-2 pl-11 text-xs font-medium text-brand" key="today">
          Danas · {formatDateShort(new Date())}
          <span className="h-px flex-1 bg-brand/30" />
        </li>
      );
    }
    if (entry.type === 'driver') return null;
    const { stop } = entry;
    return (
      <StopCard
        clientName={clientName}
        driverName={driverName}
        handlers={handlers}
        highlighted={stop.id === highlight}
        isNext={stop.id === next?.id}
        key={stop.id}
        last={stop.id === lastStopId}
        stop={stop}
      />
    );
  };

  return (
    <DashboardLayout breadcrumbs={[CRUMBS.vehicleStops, { label: `Ruta ${vehicle.registration}` }]}>
      <PageTitle title={`Ruta ${vehicle.registration}`} type="Prijevoz" />
      <div className="flex flex-col gap-5">
        <header className="flex flex-col gap-3">
          <BackLink />
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h1 className="font-heading text-3xl font-bold tracking-tight">
                Ruta <span className="font-mono">{vehicle.registration}</span>
              </h1>
              <span className="text-sm text-muted-foreground">
                {[
                  vehicle.brand,
                  trailer && `prikolica ${trailer.registration}`,
                  currentDriver ? `vozač ${currentDriver}` : 'bez vozača',
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </span>
            </div>
            <Button onClick={openNew}>
              <Icon data-icon="inline-start" icon="IconPlus" size="s" /> Dodaj utovar / istovar
            </Button>
          </div>
        </header>

        {stops.length === 0 ? (
          <Empty className="min-h-80 rounded-xl border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Icon icon="IconRoute" size="m" />
              </EmptyMedia>
              <EmptyTitle>Ruta je prazna</EmptyTitle>
              <EmptyDescription>Dodijelite vozilu nalog ili dodajte utovar / istovar.</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" onClick={openNew}>
                <Icon data-icon="inline-start" icon="IconPlus" size="s" /> Dodaj utovar / istovar
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="relative max-w-4xl">
            {showFetching && <LoadingBar className="-top-2" />}
            <DndContext
              collisionDetection={closestCenter}
              sensors={sensors}
              onDragCancel={() => setActiveDragId(null)}
              onDragEnd={handleDragEnd}
              onDragStart={(event: DragStartEvent) => setActiveDragId(event.active.id as string)}
            >
              <SortableContext items={visibleStops.map((stop) => stop.id)} strategy={verticalListSortingStrategy}>
                <ol className={dimmed(showFetching, 'flex flex-col')}>
                  {blocks.map((block, index) => {
                    if (block.kind === 'loose') return renderEntry(block.entry);
                    const tone = driverToneClasses(block.driverId);
                    const name = driverName(block.driverId);
                    const runStops = stops.filter((stop) => block.ids.includes(stop.id) && !isDone(stop));
                    const scopes: DriverScope[] = [
                      {
                        key: 'run',
                        label: block.driverId ? `Samo oni koje vozi ${name ?? 'ovaj vozač'}` : 'Samo oni bez vozača',
                        stops: runStops,
                      },
                      {
                        key: 'route',
                        label: 'Svi nezavršeni na ovom vozilu',
                        stops: stops.filter((stop) => !isDone(stop)),
                      },
                    ];
                    return (
                      <li className="relative mb-2 pl-10" key={`run-${index}`}>
                        <span className={cn('absolute top-9 bottom-3 left-[13px] w-1 rounded-full', tone.bar)} />
                        <DriverAvatar
                          className="absolute top-0.5 left-0"
                          driverId={block.driverId}
                          name={name}
                          size="md"
                        />
                        <div className="flex h-8 items-center gap-2 text-sm">
                          {block.driverId ? (
                            <span className="font-medium">{name ?? 'Vozač'}</span>
                          ) : (
                            <span className="font-medium text-destructive">Bez vozača</span>
                          )}
                          <DriverChangePopover
                            driverId={block.driverId}
                            driverName={driverName}
                            loadingRoute={isLoadingRoute}
                            scopes={scopes}
                            onOpen={() => void loadWholeRoute()}
                          />
                        </div>
                        <ol className="flex flex-col">{block.entries.map(renderEntry)}</ol>
                      </li>
                    );
                  })}
                </ol>
              </SortableContext>
              <DragOverlay dropAnimation={null}>
                {activeDragStop ? (
                  <div className="flex flex-col gap-1 rounded-xl border bg-card p-4 shadow-lg">
                    <span className="flex items-center gap-2">
                      <StopDate className="text-sm" stop={activeDragStop} />
                      <StopKinds stop={activeDragStop} />
                    </span>
                    <span className="font-medium">{placeOnly(activeDragStop)}</span>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
            <div className="h-1" ref={sentinelRef} />
            {isFetchingNextPage && <StopCardSkeleton />}
          </div>
        )}
      </div>

      <StopSheet target={sheet} vehicleId={vehicleId} onClose={() => setSheet(null)} />
      <DriverHandoverDialog
        driverName={driverName}
        from={handoverFrom}
        stops={stops}
        onClose={() => setHandoverFrom(null)}
      />
      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <Icon icon="IconTrash" size="m" />
            </AlertDialogMedia>
            <AlertDialogTitle>Obrisati {toDelete ? kindWord(toDelete) : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete &&
                `${placeOnly(toDelete)} · ${toDelete.date ? formatDateShort(toDelete.date) : 'bez datuma'}. `}
              Tereti se vraćaju na nalog kao nedodijeljeni. Ovo se ne može poništiti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Odustani</AlertDialogCancel>
            <AlertDialogAction loading={isDeleting} variant="destructive" onClick={() => void confirmDelete()}>
              <Icon data-icon="inline-start" icon="IconTrash" size="s" /> Obriši
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

function BackLink() {
  return (
    <Link
      className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      href="/dashboard/vehicle-stops"
    >
      <Icon icon="IconArrowLeft" size="s" /> Prijevozi
    </Link>
  );
}

function StopCardSkeleton() {
  return (
    <div className="flex gap-3 pl-10">
      <Skeleton className="size-8 shrink-0 rounded-full" />
      <div className="mb-3 flex flex-1 flex-col gap-2 rounded-xl border p-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  );
}

/** First load: page-shaped. */
function RouteSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-4 w-20" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="flex max-w-4xl flex-col">
        <div className="mb-2 flex items-center gap-3">
          <Skeleton className="size-7 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <StopCardSkeleton />
        <StopCardSkeleton />
        <StopCardSkeleton />
      </div>
    </div>
  );
}
