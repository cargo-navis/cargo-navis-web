/**
 * Utovari i istovari in the quick look (lab /quick-look, variant „A · status”): the nalog's stops as a vertical
 * timeline by date. Date column (a date equal to the row above is left out) · marker on a line · UTOVAR / ISTOVAR,
 * place, tereti as T1 · T2 chips. The line and markers carry PROGRESS in the table's route track colours and rules
 * (routeData): green ✓ done, blue truck = vehicle on its way to the next stop, red clock = the next stop late
 * („Kasni 2 dana”, its date red), hollow grey ring = not started. Each segment takes the colour of the stop it leads
 * to. Orange / teal only on the UTOVAR / ISTOVAR word (grey once done): status colours never for kind, kind colours
 * never for status.
 * Agency nalozi (AgencyRouteStops, lab /quick-look „Nalog: Agencijski”): the same stops, but nobody reports — only the
 * dispatcher's hand marks (routeData buildAgencyRouteStops). Marked = green ✓ + green line up to it, grey UTOVARENO /
 * ISTOVARENO, „Označeno ručno”; date passed and not marked = amber ring, amber tint, „Rok prošao · označi status” and
 * the mark button highlighted; otherwise a grey ring. No truck, no blue, no red „Kasni”, no „Sljedeće”.
 */

import * as React from 'react';

import { CountryFlag } from '@/components/shared/country-flag';
import { STOP_KIND } from '@/components/shared/stop-kind';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Cargo, Shipment, VehicleStop } from '@/lib/api';
import { cn } from '@/lib/utils';
import { formatDateShort, formatLate } from '@/lib/utils/date';
import { pluralCount } from '@/lib/utils/plural';
import { Icon, type IconType } from '@/ui';

import { AGENCY_STATUS_LABEL } from '../shared/cargo';
import { useSetCargoStatus } from '../shared/cargoStatus';
import { STATUS_BAR, STATUS_TEXT } from '../shared/tones';
import {
  type AgencyRouteStop,
  agencyStopChanges,
  type AgencyStopState,
  agencyUndoBlocked,
  buildAgencyRouteStops,
  buildRouteStops,
  type RouteStop,
  type RouteStopState,
  toTrackCargo,
} from './routeData';

/** The next stop (first not done) in any of its moods: tagged „Sljedeće”. */
export const NEXT: RouteStopState[] = ['transit', 'late', 'waiting'];

const MARKER_ICON: Partial<Record<RouteStopState, { icon: IconType; className: string; solid?: boolean }>> = {
  done: { icon: 'IconCircleCheck', className: STATUS_TEXT.success, solid: true },
  transit: { icon: 'IconTruck', className: STATUS_TEXT.info },
  late: { icon: 'IconClockExclamation', className: 'text-destructive' },
};

/**
 * Icon = where the cargo is, colour = how it's going (same as the table): a late utovar is a red clock (nothing has
 * moved yet), a late istovar a red truck (loaded, on its way, just late).
 */
function markerFor(state: RouteStopState, kind: RouteStop['kind']) {
  if (state === 'late' && kind === 'unloading') return { icon: 'IconTruck' as IconType, className: 'text-destructive' };
  return MARKER_ICON[state];
}

/** Not started: a hollow grey ring, filled with the surface it sits on (`className`, default the sheet's popover). */
const Hollow = ({ className }: { className?: string }) => (
  <span className={cn('size-3 shrink-0 rounded-full border-2 border-muted-foreground/40 bg-popover', className)} />
);

/**
 * done = filled green ✓ (as the table); else a hollow grey ring. The next stop's truck / clock sits on the line leading
 * into it (the vehicle is between stops, as in the table) — only a first stop with no line above shows it here.
 */
export function Marker({
  state,
  kind,
  first,
  className,
}: {
  state: RouteStopState;
  kind: RouteStop['kind'];
  first: boolean;
  /** The hollow ring's fill (the surface behind it). */
  className?: string;
}) {
  const marker = markerFor(state, kind);
  if (!marker || (state !== 'done' && !first)) return <Hollow className={className} />;
  return (
    <Icon
      className={cn('size-4! shrink-0 [&_svg]:size-full!', marker.className)}
      icon={marker.icon}
      size="s"
      type={marker.solid ? 'solid' : 'outline'}
    />
  );
}

/** The segment from a stop down to the following one, coloured by that stop (done / on its way / late / not yet). */
const SEGMENT: Record<RouteStopState, string> = {
  done: STATUS_BAR.done,
  transit: STATUS_BAR.transit,
  late: STATUS_BAR.late,
  waiting: STATUS_BAR.idle,
  planned: STATUS_BAR.idle,
};

/**
 * Line down to the following stop. On the way / late: half coloured with the truck / clock at the halfway point and
 * the rest grey (like the table's track), else one colour.
 */
export function Segment({ to, kind }: { to: RouteStopState; kind: RouteStop['kind'] }) {
  const marker = to === 'transit' || to === 'late' ? markerFor(to, kind) : undefined;
  if (!marker) return <span className={cn('w-0.5 flex-1 rounded-full', SEGMENT[to])} />;
  return (
    <span className="flex flex-1 flex-col items-center">
      <span className={cn('w-0.5 flex-1 rounded-full', SEGMENT[to])} />
      <Icon
        className={cn('my-0.5 size-4! shrink-0 [&_svg]:size-full!', marker.className)}
        icon={marker.icon}
        size="s"
      />
      <span className={cn('w-0.5 flex-1 rounded-full', STATUS_BAR.idle)} />
    </span>
  );
}

function StopPlace({ stop }: { stop: Pick<RouteStop, 'place' | 'done'> }) {
  const { place } = stop;
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      {place?.countryCode && <CountryFlag code={place.countryCode} size="xs" />}
      {place?.postalCode && <span className="shrink-0 text-muted-foreground tabular-nums">{place.postalCode}</span>}
      <span className={cn('truncate font-medium', stop.done && 'text-muted-foreground')}>
        {place?.placeName ?? '—'}
      </span>
    </span>
  );
}

/** A finished stop says what happened, not just what it was. */
export const DONE_LABEL = { loading: 'Utovareno', unloading: 'Istovareno' } as const;

export function RouteStops({ cargos, vehicleStops }: { cargos: Cargo[]; vehicleStops?: VehicleStop[] }) {
  const stops = React.useMemo(
    () => buildRouteStops(cargos.map((cargo) => toTrackCargo(cargo, vehicleStops))),
    [cargos, vehicleStops]
  );
  const cargoNumber = React.useMemo(() => new Map(cargos.map((cargo, index) => [cargo.id, index + 1])), [cargos]);
  if (!stops.length) return <span className="text-muted-foreground">—</span>;

  const loadings = stops.filter((stop) => stop.kind === 'loading').length;
  const doneCount = stops.filter((stop) => stop.done).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground tabular-nums">
        <span>
          {pluralCount(loadings, ['utovar', 'utovara', 'utovara'])} ·{' '}
          {pluralCount(stops.length - loadings, ['istovar', 'istovara', 'istovara'])}
        </span>
        <span>
          {doneCount} od {stops.length} gotovo
        </span>
      </div>
      <ol className="flex flex-col">
        {stops.map((stop, index) => {
          const following = stops[index + 1];
          const last = !following;
          const { state } = stop;
          // Only a real date repeats; two undated stops aren't „the same day”.
          const sameDay = !!stop.day && index > 0 && stops[index - 1].day === stop.day;
          return (
            <li className="grid grid-cols-[3rem_1rem_minmax(0,1fr)] gap-x-3" key={stop.key}>
              <span
                className={cn(
                  // Same 20px row as the marker and the kind word, all centred on the dot.
                  'flex h-5 items-center justify-end text-xs leading-none tabular-nums',
                  stop.done || !stop.date ? 'text-muted-foreground' : 'font-medium',
                  state === 'late' && 'text-destructive'
                )}
              >
                {sameDay || !stop.date ? '' : formatDateShort(stop.date)}
              </span>
              <span className="flex flex-col items-center">
                <span className="flex h-5 items-center">
                  <Marker first={index === 0} kind={stop.kind} state={state} />
                </span>
                {following && <Segment kind={following.kind} to={following.state} />}
              </span>
              <div className={cn('flex min-w-0 flex-col gap-1', !last && 'pb-5')}>
                <span className="flex h-5 items-center gap-2">
                  <span
                    className={cn(
                      'text-[0.6875rem] leading-none font-semibold tracking-wide uppercase',
                      stop.done ? 'text-muted-foreground' : STOP_KIND[stop.kind].text
                    )}
                  >
                    {stop.done ? DONE_LABEL[stop.kind] : STOP_KIND[stop.kind].label}
                  </span>
                  {!stop.date && <span className="text-xs text-muted-foreground">Bez datuma</span>}
                  {NEXT.includes(state) && (
                    <Badge look="solid" size="sm" tone="brand">
                      Sljedeće
                    </Badge>
                  )}
                  {state === 'transit' && <span className={cn('text-xs', STATUS_TEXT.info)}>Vozilo na putu</span>}
                  {state === 'late' && (
                    <span className="text-xs font-medium text-destructive">{formatLate(stop.daysLate)}</span>
                  )}
                </span>
                <StopPlace stop={stop} />
                <span className="flex flex-wrap gap-1">
                  {stop.cargos.map((cargo) => (
                    <Badge className={cn(stop.done && 'opacity-70')} key={cargo.id} look="outline" size="sm">
                      T{cargoNumber.get(cargo.id)}
                    </Badge>
                  ))}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Agency nalozi: the plan + the dispatcher's hand marks.
// ---------------------------------------------------------------------------------------------------------------------

export function AgencyMarker({ state, className }: { state: AgencyStopState; className?: string }) {
  if (state === 'marked')
    return (
      <Icon
        className={cn('size-4! shrink-0 [&_svg]:size-full!', STATUS_TEXT.success)}
        icon="IconCircleCheck"
        size="s"
        type="solid"
      />
    );
  return (
    <span
      className={cn(
        'size-3 shrink-0 rounded-full border-2 bg-popover',
        state === 'overdue' ? 'border-warning-dot' : 'border-muted-foreground/40',
        className
      )}
    />
  );
}

export const MARK_LABEL = { loading: 'Označi utovareno', unloading: 'Označi istovareno' } as const;
export const UNDO_LABEL = { loading: 'Vrati na Nije utovaren', unloading: 'Vrati na Utovaren' } as const;
/** The mark button once the date passed: amber, the one thing to do here (lab: amber-500 fill). */
export const OVERDUE_BUTTON =
  'border-transparent bg-warning-dot text-amber-950 hover:bg-warning-dot/85 hover:text-amber-950 dark:border-transparent dark:bg-warning-dot dark:hover:bg-warning-dot/85';

/**
 * An agency nalog's stops with the hand marks, and `mark(stop, undo)`: „Označi utovareno / istovareno” (or „Vrati na …”)
 * for every teret of the stop at once. Shared by the quick look and the Nalog detail's Relacija.
 */
export function useAgencyRoute(shipment: Pick<Shipment, 'id' | 'cargo' | 'vehicleStops'>) {
  const { cargo: cargos, vehicleStops } = shipment;
  const stops = React.useMemo(
    () => buildAgencyRouteStops(cargos.map((cargo) => toTrackCargo(cargo, vehicleStops))),
    [cargos, vehicleStops]
  );
  const cargoNumber = React.useMemo(() => new Map(cargos.map((cargo, index) => [cargo.id, index + 1])), [cargos]);
  const { set, isPending } = useSetCargoStatus(shipment);
  const [busyKey, setBusyKey] = React.useState<string>();

  const mark = async (stop: AgencyRouteStop, undo: boolean) => {
    const changes = agencyStopChanges(stop, undo);
    if (!changes.length) return;
    const tereti = stop.cargos.map((cargo) => `T${cargoNumber.get(cargo.id)}`).join(', ');
    setBusyKey(stop.key);
    await set(changes, {
      title: `Status tereta: ${AGENCY_STATUS_LABEL[changes[0].status]}`,
      description: [tereti, stop.place?.placeName].filter(Boolean).join(' · '),
    });
    setBusyKey(undefined);
  };

  return { stops, cargoNumber, mark, isPending, busyKey };
}

export function AgencyRouteStops({ shipment }: { shipment: Pick<Shipment, 'id' | 'cargo' | 'vehicleStops'> }) {
  const { stops, cargoNumber, mark, isPending, busyKey } = useAgencyRoute(shipment);
  if (!stops.length) return <span className="text-muted-foreground">—</span>;

  const loadings = stops.filter((stop) => stop.kind === 'loading').length;
  const markedCount = stops.filter((stop) => stop.state === 'marked').length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground tabular-nums">
        <span>
          {pluralCount(loadings, ['utovar', 'utovara', 'utovara'])} ·{' '}
          {pluralCount(stops.length - loadings, ['istovar', 'istovara', 'istovara'])}
        </span>
        <span>
          {markedCount} od {stops.length} označeno
        </span>
      </div>
      <ol className="flex flex-col">
        {stops.map((stop, index) => {
          const following = stops[index + 1];
          const marked = stop.state === 'marked';
          const overdue = stop.state === 'overdue';
          const blocked = agencyUndoBlocked(stop);
          const sameDay = !!stop.day && index > 0 && stops[index - 1].day === stop.day;
          return (
            <li className="grid grid-cols-[3rem_1rem_minmax(0,1fr)] gap-x-3" key={stop.key}>
              <span
                className={cn(
                  'flex h-5 items-center justify-end text-xs leading-none tabular-nums',
                  marked || !stop.date ? 'text-muted-foreground' : 'font-medium'
                )}
              >
                {sameDay || !stop.date ? '' : formatDateShort(stop.date)}
              </span>
              <span className="flex flex-col items-center">
                <span className="flex h-5 items-center">
                  <AgencyMarker state={stop.state} />
                </span>
                {/* Green only up to a marked stop; nobody tracks a vehicle, so nothing in between. */}
                {following && (
                  <span
                    className={cn(
                      'w-0.5 flex-1 rounded-full',
                      following.state === 'marked' ? STATUS_BAR.done : STATUS_BAR.idle
                    )}
                  />
                )}
              </span>
              <div className={cn('min-w-0', following && 'pb-5')}>
                {/* Negative margins keep the tinted block on the marker's line. */}
                <div
                  className={cn(
                    'flex min-w-0 flex-col gap-1',
                    overdue && '-mx-2 -my-1 rounded-lg bg-warning-soft px-2 py-1'
                  )}
                >
                  <span className="flex h-5 items-center gap-2">
                    <span
                      className={cn(
                        'text-[0.6875rem] leading-none font-semibold tracking-wide uppercase',
                        marked ? 'text-muted-foreground' : STOP_KIND[stop.kind].text
                      )}
                    >
                      {marked ? DONE_LABEL[stop.kind] : STOP_KIND[stop.kind].label}
                    </span>
                    {!stop.date && <span className="text-xs text-muted-foreground">Bez datuma</span>}
                    {overdue && <span className={cn('text-xs', STATUS_TEXT.warning)}>Rok prošao · označi status</span>}
                  </span>
                  <StopPlace stop={stop} />
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="flex flex-wrap gap-1">
                      {stop.cargos.map((cargo) => (
                        <Badge className={cn(marked && 'opacity-70')} key={cargo.id} look="outline" size="sm">
                          T{cargoNumber.get(cargo.id)}
                        </Badge>
                      ))}
                    </span>
                    {/* The API keeps no who / when for a hand mark: say only that it was set by hand. */}
                    {marked && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Icon icon="IconCheck" size="xs" /> Označeno ručno
                      </span>
                    )}
                  </span>
                  <span className="flex items-center gap-1 pt-0.5">
                    {marked ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          disabled={isPending}
                          render={<Button aria-label="Više akcija" size="icon-xs" variant="ghost" />}
                        >
                          <Icon icon="IconDots" size="xs" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-60">
                          <DropdownMenuItem disabled={blocked} onClick={() => void mark(stop, true)}>
                            <Icon icon="IconArrowBackUp" size="s" /> {UNDO_LABEL[stop.kind]}
                          </DropdownMenuItem>
                          {blocked && (
                            <p className="px-2 pb-1.5 text-xs text-muted-foreground">
                              Teret je već označen istovarenim. Prvo vrati istovar.
                            </p>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <Button
                        className={cn(overdue && OVERDUE_BUTTON)}
                        disabled={isPending}
                        loading={busyKey === stop.key}
                        size="xs"
                        variant="outline"
                        onClick={() => void mark(stop, false)}
                      >
                        <Icon data-icon="inline-start" icon="IconCheck" size="xs" />
                        {MARK_LABEL[stop.kind]}
                      </Button>
                    )}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
