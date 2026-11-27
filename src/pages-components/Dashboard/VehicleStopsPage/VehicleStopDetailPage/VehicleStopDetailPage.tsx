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
import { track } from '@/lib/analytics';
import { notifyVehicleStopDriver, type VehicleStop } from '@/lib/api/vehicleStops';
import { useClients, useDelayedFlag, useVehicles } from '@/lib/hooks';
import { useDeleteVehicleStop, useRearrangeVehicleStop, useVehicleStops } from '@/lib/hooks/api/vehicleStops';
import { cn } from '@/lib/utils';
import { formatDateShort } from '@/lib/utils/date';
import { driverToneClasses } from '@/lib/utils/driverTone';
import { closeToast, showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Icon } from '@/ui';

import { routeFacts } from '../routeFacts';
import { useEmployeeNames } from '../StopLine';
import { chronological, firstName, isDone, kindWord, placeOnly, stopToastTitle } from '../stops';
import { DriverChangePopover, DriverHandoverDialog, type DriverScope } from './DriverChange';
import { buildBlocks, buildEntries, type Entry, foldedCount } from './routeEntries';
import { type SameDayOrder, StopCard, type StopCardHandlers } from './StopCard';
import { StopSheet, type StopSheetTarget } from './StopSheet';

/**
 * Ruta of one vehicle (DECISIONS §5 Prijevozi, lab /transports `RouteView`): today's order — newest first — with runs of
 * the same driver drawn as avatar + side bar in the driver's colour (name + „Promijeni”; red dashed „Bez vozača” +
 * „Dodijeli vozača” when none), a „Danas” line, earlier finished ones folded away, cards with inline date edit and a ⋯
 * menu, the stop form in a side sheet. `?highlight=<stopId>` scrolls to a stop and rings it. 2+ unfinished stops on
 * one date (or all undated ones) sit in an „Isti dan” box in driving order, numbered, with „Pomakni prije / kasnije”
 * (lab /transports, decided 2026-11-21; replaces drag-and-drop — the backend only reorders within a date anyway).
 */
/**
 * Hidden until the redesign is released (user 2026-11-23): the „Promijeni” popover next to each driver run (change the
 * driver for the run / the whole vehicle). Code kept — set back to true to restore it.
 */
const SHOW_RUN_DRIVER_CHANGE = true;

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
  const { mutate: rearrangeStop, isPending: isMoving } = useRearrangeVehicleStop(vehicleId);

  const vehicle = React.useMemo(() => vehicles?.find((item) => item.id === vehicleId), [vehicles, vehicleId]);
  /** Newest first (the API's route order). */
  const stops = React.useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);

  const [showEarlier, setShowEarlier] = React.useState(false);
  const [sheet, setSheet] = React.useState<StopSheetTarget | null>(null);
  const [toDelete, setToDelete] = React.useState<VehicleStop | null>(null);
  const [handoverFrom, setHandoverFrom] = React.useState<VehicleStop | null>(null);

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

  /** The day a stop belongs to for reordering: its date; undated stops share no day (2026-11-23: no „Isti dan” box,
   * no „Pomakni” for them — only exactly the same date). */
  const dayOf = (stop: VehicleStop) => stop.date?.slice(0, 10);
  /** Unfinished stops on the same date as `stop`, in driving order (none for an undated stop). */
  const sameDayOf = (stop: VehicleStop) =>
    isDone(stop) || !dayOf(stop)
      ? []
      : chronological(stops).filter((item) => !isDone(item) && dayOf(item) === dayOf(stop));

  /** One place earlier / later in that day's order: right before the one ahead of it, or right after the one behind. */
  function move(stop: VehicleStop, by: -1 | 1) {
    const day = sameDayOf(stop);
    const other = day[day.findIndex((item) => item.id === stop.id) + by];
    if (!other) return;
    const [first, second] = by === -1 ? [stop, other] : [other, stop];
    rearrangeStop(
      { stopId: stop.id, previousStopId: by === -1 ? other.previousStopId : other.id },
      {
        onSuccess: () => {
          track('route reordered');
          const notified = [stop, other].filter((item) => item.messageSentAt && item.driverId);
          const toastId = showSuccessToast({
            title: 'Redoslijed promijenjen',
            description: `${stop.date ? formatDateShort(stop.date) : 'Bez datuma'}: prvo ${placeOnly(first)}, zatim ${placeOnly(second)}.${notified.length ? ' Vozač još nije obaviješten o novom redoslijedu.' : ''}`,
            timeout: notified.length ? 8000 : undefined,
            action: notified.length
              ? {
                  label: 'Obavijesti vozača',
                  onClick: () => {
                    closeToast(toastId);
                    void Promise.all(notified.map((item) => notifyVehicleStopDriver(item.id)))
                      .then(() => showSuccessToast({ title: 'Vozač obaviješten o novom redoslijedu' }))
                      .catch(() => showErrorToast({ title: 'Obavijest nije poslana', description: 'Pokušaj ponovno.' }))
                      .finally(
                        () => void queryClient.invalidateQueries({ queryKey: ['vehicleStops', 'paginated', vehicleId] })
                      );
                  },
                }
              : undefined,
          });
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
          showErrorToast({ title: 'Premještanje nije uspjelo', description: 'Pokušaj ponovno.' });
        },
      }
    );
  }

  const firstNameOf = (id: string | null) => {
    const name = driverName(id);
    return name ? firstName(name) : undefined;
  };

  const sameDayOrder = (stop: VehicleStop): SameDayOrder | undefined => {
    const day = sameDayOf(stop);
    if (day.length < 2) return undefined;
    return {
      n: day.findIndex((item) => item.id === stop.id) + 1,
      total: day.length,
      onEarlier: () => move(stop, -1),
      onLater: () => move(stop, 1),
      isMoving,
    };
  };

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
      showSuccessToast({ title: stopToastTitle(toDelete, 'obrisan') });
      setToDelete(null);
    } catch {
      showErrorToast({ title: 'Brisanje nije uspjelo', description: 'Pokušaj ponovno.' });
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
            <EmptyDescription>Provjeri vezu i pokušaj ponovno.</EmptyDescription>
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
        sameDay={sameDayOrder(stop)}
        stop={stop}
      />
    );
  };

  /** A run's rows with neighbouring unfinished stops of one day wrapped in an „Isti dan” box (driving order inside). */
  const renderRunEntries = (runEntries: Entry[]) => {
    const groups: Entry[][] = [];
    for (const entry of runEntries) {
      const previous = groups.at(-1)?.[0];
      const together =
        previous?.type === 'stop' &&
        entry.type === 'stop' &&
        !isDone(previous.stop) &&
        !isDone(entry.stop) &&
        !!dayOf(entry.stop) &&
        dayOf(previous.stop) === dayOf(entry.stop);
      if (together) groups[groups.length - 1].push(entry);
      else groups.push([entry]);
    }
    const order = new Map(chronological(stops).map((stop, index) => [stop.id, index]));
    return groups.map((group) => {
      if (group.length === 1) return renderEntry(group[0]);
      const day = group.flatMap((entry) => (entry.type === 'stop' ? [entry.stop] : []));
      day.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
      const { date } = day[0];
      return (
        // -mx: the box's border + padding sit outside the column, so its markers stay on the route's line.
        <li
          className="-mx-[13px] mb-3 rounded-2xl border border-brand/30 bg-brand/5 px-3 pt-3"
          key={`day-${day[0].id}`}
        >
          <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 pl-11 text-sm">
            <Icon className="text-brand" icon="IconArrowsSort" size="s" />
            <span className="font-medium">
              {date ? formatDateShort(date) : 'Bez datuma'} · {day.length} mjesta isti dan
            </span>
            <span className="text-muted-foreground">
              · {firstNameOf(day[0].driverId) ?? 'vozač'} ih obilazi ovim redom
            </span>
          </div>
          <ol className="flex flex-col">{day.map((stop) => renderEntry({ type: 'stop', stop }))}</ol>
        </li>
      );
    });
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
              <EmptyDescription>Dodijeli vozilu nalog ili dodaj utovar / istovar.</EmptyDescription>
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
                    <DriverAvatar className="absolute top-0.5 left-0" driverId={block.driverId} name={name} size="md" />
                    <div className="flex h-8 items-center gap-2 text-sm">
                      {block.driverId ? (
                        <span className="font-medium">{name ?? 'Vozač'}</span>
                      ) : (
                        <span className="font-medium text-destructive">Bez vozača</span>
                      )}
                      {SHOW_RUN_DRIVER_CHANGE && (
                        <DriverChangePopover
                          driverId={block.driverId}
                          driverName={driverName}
                          loadingRoute={isLoadingRoute}
                          scopes={scopes}
                          onOpen={() => void loadWholeRoute()}
                        />
                      )}
                    </div>
                    <ol className="flex flex-col">{renderRunEntries(block.entries)}</ol>
                  </li>
                );
              })}
            </ol>
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
