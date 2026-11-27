/**
 * „Utovar / Istovar” cell (lab /routes route-track.tsx, used by /tables): a progress track per cargo between its first
 * and last stop, coloured by load status (grey waiting, red late, blue truck while loaded, green check unloaded).
 * Cargos sharing a loading or unloading point are drawn once with connected branches („auto” grouping = fewer rows).
 * Place layout picked in the lab: flag + postal + date chip on line 1, the name below (truncated).
 * Agency nalozi (`isAgency`): nobody reports, the dispatcher marks each teret by hand (routeData agencyRouteState) — no
 * red „Kasni”, no blue truck. All istovareno = green ✓ as own; all utovareno = green ✓ at the utovar, grey line; a date
 * passed and not marked = amber ring („Rok prošao · označi status”, date chip amber); otherwise grey.
 * With the Nalozi date filter on (`dateFilter`), the date chips in its range turn petrol: why the nalog is listed.
 */

import * as React from 'react';

import { CountryFlag } from '@/components/shared/country-flag';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Cargo, VehicleStop } from '@/lib/api';
import { LoadStatus } from '@/lib/api/shipments';
import { cn } from '@/lib/utils';
import { getCountryName } from '@/lib/utils/countries';
import { formatDateShort } from '@/lib/utils/date';
import { Icon, type IconType } from '@/ui';

import { type DateFilter, isInDateFilter } from '../shared/dateFilter';
import { STATUS_BAR, STATUS_BORDER, STATUS_TEXT, TOOLTIP_PILL } from '../shared/tones';
import {
  agencyEndpointState,
  type AgencyRouteState,
  agencyRouteState,
  isPast,
  type Place,
  placeKey,
  type RouteState,
  routeState,
  toTrackCargo,
  type TrackCargo,
} from './routeData';

interface Endpoint {
  place: Place | null;
  /** Already formatted: „11.11.” or „11.11.–12.11.”. */
  date: string;
  /** Earliest ISO date of the endpoint (lateness). */
  firstDate: string | null;
  cargos: TrackCargo[];
}

interface RouteGroup {
  key: string;
  left: Endpoint[];
  right: Endpoint[];
}

type Side = 'loading' | 'unloading';

/** The list's date filter, for the date chips it matched (set by RouteTrack, read by PlaceBlock). */
const DateFilterContext = React.createContext<DateFilter | undefined>(undefined);

function matchesDateFilter(point: Endpoint, side: Side, filter: DateFilter | undefined) {
  if (!filter || (filter.type !== 'any' && filter.type !== side)) return false;
  return point.cargos.some((cargo) => isInDateFilter(side === 'loading' ? cargo.readyDate : cargo.dueDate, filter));
}

function groupBy<T>(items: T[], key: (item: T) => string) {
  const map = new Map<string, T[]>();
  items.forEach((item) => map.set(key(item), [...(map.get(key(item)) ?? []), item]));
  return [...map.values()];
}

/** One date, or „11.11.–12.11.” when merged cargos have different dates. */
function endpointDates(dates: (string | null)[]) {
  const sorted = [...new Set(dates.filter((date): date is string => !!date))].sort();
  const labels = [...new Set(sorted.map(formatDateShort))];
  return {
    date: labels.length > 1 ? `${labels[0]}–${labels[labels.length - 1]}` : (labels[0] ?? '—'),
    firstDate: sorted[0] ?? null,
  };
}

function endpoint(place: Place | null, dates: (string | null)[], cargos: TrackCargo[]): Endpoint {
  return { place, ...endpointDates(dates), cargos };
}

function buildGroupsBy(cargos: TrackCargo[], byFrom: boolean): RouteGroup[] {
  return groupBy(cargos, (cargo) => placeKey(byFrom ? cargo.from : cargo.to)).map((group) => {
    const shared = byFrom
      ? endpoint(
          group[0].from,
          group.map((cargo) => cargo.readyDate),
          group
        )
      : endpoint(
          group[0].to,
          group.map((cargo) => cargo.dueDate),
          group
        );
    // Identical pairs (same loading and unloading) merge into one endpoint with a count.
    const others = groupBy(group, (cargo) => placeKey(byFrom ? cargo.to : cargo.from)).map((same) =>
      byFrom
        ? endpoint(
            same[0].to,
            same.map((cargo) => cargo.dueDate),
            same
          )
        : endpoint(
            same[0].from,
            same.map((cargo) => cargo.readyDate),
            same
          )
    );
    return { key: placeKey(shared.place), left: byFrom ? [shared] : others, right: byFrom ? others : [shared] };
  });
}

/** „auto”: group by loading or by unloading, whichever gives fewer rows (on a tie, fewer groups). */
function buildGroups(cargos: TrackCargo[]): RouteGroup[] {
  const byLoading = buildGroupsBy(cargos, true);
  const byUnloading = buildGroupsBy(cargos, false);
  const rows = (groups: RouteGroup[]) =>
    groups.reduce((sum, group) => sum + Math.max(group.left.length, group.right.length), 0);
  if (rows(byUnloading) !== rows(byLoading)) return rows(byUnloading) < rows(byLoading) ? byUnloading : byLoading;
  return byUnloading.length < byLoading.length ? byUnloading : byLoading;
}

/** Rows of a group: each pairs one left and one right endpoint (the single side repeats). */
function groupRows(group: RouteGroup) {
  const count = Math.max(group.left.length, group.right.length);
  return Array.from({ length: count }, (_, index) => {
    const left = group.left[Math.min(index, group.left.length - 1)];
    const right = group.right[Math.min(index, group.right.length - 1)];
    const cargos = group.left.length > 1 ? left.cargos : right.cargos;
    return { left, right, cargos };
  });
}

const STATE: Record<RouteState, { label: string; icon: IconType; text: string; bar: string }> = {
  waiting: { label: 'Čeka utovar', icon: 'IconPackage', text: STATUS_TEXT.muted, bar: STATUS_BAR.idle },
  late: { label: 'Kasni utovar', icon: 'IconClockExclamation', text: 'text-destructive', bar: STATUS_BAR.late },
  partial: {
    label: 'Djelomično utovareno',
    icon: 'IconPackageImport',
    text: STATUS_TEXT.info,
    bar: STATUS_BAR.partial,
  },
  transit: { label: 'Utovareno', icon: 'IconTruck', text: STATUS_TEXT.info, bar: STATUS_BAR.transit },
  lateUnloading: {
    label: 'Kasni istovar',
    icon: 'IconTruck',
    text: 'text-destructive',
    bar: STATUS_BAR.late,
  },
  done: { label: 'Istovareno', icon: 'IconPackageExport', text: STATUS_TEXT.success, bar: STATUS_BAR.done },
};

/** Status of the cargos at this point, worded for its side. */
function endpointStatus(point: Endpoint, side: Side): { label: string; state: RouteState } {
  const total = point.cargos.length;
  const loaded = point.cargos.filter((cargo) => cargo.status !== LoadStatus.NotYetLoaded).length;
  const unloaded = point.cargos.filter((cargo) => cargo.status === LoadStatus.Unloaded).length;
  const state = routeState(point.cargos);
  if (side === 'loading') {
    if (loaded === total) return { label: total > 1 ? `Utovareno (${total})` : 'Utovareno', state: 'transit' };
    if (loaded > 0) return { label: `${loaded}/${total} utovareno`, state: 'partial' };
    return { label: state === 'late' ? 'Kasni utovar' : 'Čeka utovar', state };
  }
  if (unloaded === total) return { label: total > 1 ? `Istovareno (${total})` : 'Istovareno', state: 'done' };
  if (unloaded > 0) return { label: `${unloaded}/${total} istovareno`, state: 'partial' };
  if (state === 'lateUnloading') return { label: 'Kasni istovar', state };
  if (loaded > 0) return { label: loaded === total ? 'Na putu' : `${loaded}/${total} na putu`, state: 'transit' };
  return { label: 'Još nije utovareno', state: 'waiting' };
}

const AGENCY_SIDE = {
  loading: { marked: 'utovareno', none: 'Nije utovareno' },
  unloading: { marked: 'istovareno', none: 'Nije istovareno' },
} as const;

const OVERDUE_LABEL = 'Rok prošao · označi status';

interface PointStatus {
  label: string;
  pill: string;
  icon: IconType;
}

/** Agency: what the dispatcher marked at this point (never tracking words: „Na putu”, „Kasni”). */
function agencyEndpointStatus(point: Endpoint, side: Side): PointStatus {
  const total = point.cargos.length;
  const { state, marked } = agencyEndpointState(point.cargos, side);
  const word = AGENCY_SIDE[side];
  if (state === 'marked')
    return {
      label: `Označeno ${word.marked}${total > 1 ? ` (${total})` : ''}`,
      pill: TOOLTIP_PILL.done,
      icon: 'IconCircleCheck',
    };
  if (state === 'overdue') return { label: OVERDUE_LABEL, pill: TOOLTIP_PILL.overdue, icon: 'IconAlertCircle' };
  return {
    label: marked > 0 ? `${marked}/${total} označeno ${word.marked}` : word.none,
    pill: TOOLTIP_PILL.waiting,
    icon: 'IconPackage',
  };
}

/** Own nalozi: as before (tracking from the Ruta). */
function ownEndpointStatus(point: Endpoint, side: Side): PointStatus {
  const { label, state } = endpointStatus(point, side);
  return { label, pill: TOOLTIP_PILL[state as keyof typeof TOOLTIP_PILL], icon: STATE[state].icon };
}

function StatusIcon({ icon, solid, className }: { icon: IconType; solid?: boolean; className?: string }) {
  return (
    <Icon
      className={cn('size-4! [&_svg]:size-full!', className)}
      icon={icon}
      size="s"
      type={solid ? 'solid' : 'outline'}
    />
  );
}

function Count({ point, hideCount }: { point: Endpoint; hideCount?: boolean }) {
  if (hideCount || point.cargos.length < 2) return null;
  return <span className="shrink-0 text-xs text-muted-foreground">×{point.cargos.length}</span>;
}

/**
 * Place block: 🇩🇪 80939 [10.11.] / München; the date chip turns red when a loading is late (agency: amber when the
 * date passed and the place isn't marked).
 */
function PlaceBlock({
  point,
  side,
  hideCount,
  isAgency,
}: {
  point: Endpoint;
  side: Side;
  hideCount?: boolean;
  isAgency?: boolean;
}) {
  const { place } = point;
  const isMatch = matchesDateFilter(point, side, React.useContext(DateFilterContext));
  const isOverdue = !!isAgency && agencyEndpointState(point.cargos, side).state === 'overdue';
  const isLate =
    !isAgency &&
    side === 'loading' &&
    point.cargos.some((cargo) => cargo.status === LoadStatus.NotYetLoaded) &&
    isPast(point.firstDate);
  return (
    <div className="flex min-w-0 flex-col">
      <span className="flex items-center gap-1.5">
        {place?.countryCode && <CountryFlag code={place.countryCode} size="xs" />}
        {place?.postalCode && <span className="shrink-0 text-muted-foreground tabular-nums">{place.postalCode}</span>}
        <span
          className={cn(
            'rounded-md px-1.5 text-xs leading-5 tabular-nums',
            isLate
              ? 'bg-destructive/10 font-medium text-destructive'
              : isOverdue
                ? 'bg-warning-soft font-medium text-warning'
                : isMatch
                  ? 'bg-primary font-medium text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
          )}
        >
          {point.date}
        </span>
        <Count hideCount={hideCount} point={point} />
      </span>
      <span className="truncate font-medium">{place?.placeName ?? '—'}</span>
    </div>
  );
}

/** Place block with a tooltip: side, full place, postal code + country, date, status. */
function Stacked({
  point,
  side,
  hideCount,
  isAgency,
}: {
  point: Endpoint;
  side: Side;
  hideCount?: boolean;
  isAgency?: boolean;
}) {
  const { place } = point;
  const status = isAgency ? agencyEndpointStatus(point, side) : ownEndpointStatus(point, side);
  const country = place?.countryCode ? (getCountryName(place.countryCode) ?? place.countryCode) : null;
  return (
    <Tooltip>
      <TooltipTrigger render={<div className="min-w-0 cursor-default" />}>
        <PlaceBlock hideCount={hideCount} isAgency={isAgency} point={point} side={side} />
      </TooltipTrigger>
      <TooltipContent className="max-w-72 p-3" side="top">
        <div className="flex flex-col gap-1 text-xs">
          <span className="text-[0.625rem] font-semibold tracking-wide uppercase opacity-70">
            {side === 'loading' ? 'Utovar' : 'Istovar'}
          </span>
          <span className="flex items-center gap-1.5 text-sm font-medium">
            {place?.countryCode && <CountryFlag code={place.countryCode} size="xs" />}
            {place?.placeName ?? 'Mjesto nije upisano'}
          </span>
          {(place?.postalCode || country) && (
            <span className="opacity-80">{[place?.postalCode, country].filter(Boolean).join(' · ')}</span>
          )}
          <span className="opacity-80 tabular-nums">
            {side === 'loading' ? 'Spremno za utovar' : 'Rok istovara'}: {point.date}
          </span>
          <span
            className={cn(
              'mt-1 inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 font-medium',
              status.pill
            )}
          >
            <StatusIcon className="size-3.5!" icon={status.icon} /> {status.label}
          </span>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

const PROGRESS: Record<RouteState, number> = {
  waiting: 0,
  late: 0,
  partial: 30,
  transit: 55,
  lateUnloading: 55,
  done: 100,
};
/** Gap around the 16px icon: lines stop short of it, so the row tint shows through. */
const GAP = '1.25rem';

function Segment({ from, to, className }: { from: string; to: string; className: string }) {
  return <div className={cn('absolute h-0.5', className)} style={{ left: from, right: `calc(100% - ${to})` }} />;
}

/** One progress line, left → right. */
function TrackLine({ state, title }: { state: RouteState; title?: string }) {
  const progress = PROGRESS[state];
  const { bar, text, label, icon } = STATE[state];
  return (
    <div className="relative flex h-5 w-full items-center" title={title ?? label}>
      {state === 'done' ? (
        <>
          <Segment className={bar} from="0px" to={`calc(100% - ${GAP})`} />
          <span className="absolute right-0">
            <StatusIcon className={text} icon="IconCircleCheck" solid />
          </span>
        </>
      ) : state === 'late' || state === 'waiting' ? (
        <>
          <span className="absolute left-0">
            <StatusIcon className={text} icon={icon} />
          </span>
          <Segment className={STATUS_BAR.idle} from={GAP} to="100%" />
        </>
      ) : (
        <>
          <Segment className={bar} from="0px" to={`calc(${progress}% - ${GAP} / 2)`} />
          <span className="absolute -translate-x-1/2" style={{ left: `${progress}%` }}>
            <StatusIcon className={text} icon="IconTruck" />
          </span>
          <Segment className={STATUS_BAR.idle} from={`calc(${progress}% + ${GAP} / 2)`} to="100%" />
        </>
      )}
    </div>
  );
}

/** Hollow ring: a utovar / istovar not marked yet (grey), or its date passed (amber) — as the quick look's Relacija. */
function Ring({ overdue }: { overdue?: boolean }) {
  return (
    <span className="flex size-4 items-center justify-center">
      <span
        className={cn('size-3 rounded-full border-2', overdue ? 'border-warning-dot' : 'border-muted-foreground/40')}
      />
    </span>
  );
}

const AGENCY_TITLE: Record<AgencyRouteState, string> = {
  done: 'Označeno istovareno',
  loaded: 'Označeno utovareno',
  overdueLoading: OVERDUE_LABEL,
  overdueUnloading: OVERDUE_LABEL,
  planned: 'Nije označeno',
};

/**
 * Agency line: green only when everything is istovareno; a marked utovar gets its ✓ on the left and the line stays
 * grey (nobody tracks the vehicle); the amber ring sits at the end that needs a mark.
 */
function AgencyTrackLine({ state }: { state: AgencyRouteState }) {
  if (state === 'done') return <TrackLine state="done" title={AGENCY_TITLE.done} />;
  const loadedMark = state === 'loaded' || state === 'overdueUnloading';
  return (
    <div className="relative flex h-5 w-full items-center" title={AGENCY_TITLE[state]}>
      <span className="absolute left-0">
        {loadedMark ? (
          <StatusIcon className={STATUS_TEXT.success} icon="IconCircleCheck" solid />
        ) : (
          <Ring overdue={state === 'overdueLoading'} />
        )}
      </span>
      <Segment
        className={STATUS_BAR.idle}
        from={GAP}
        to={state === 'overdueUnloading' ? `calc(100% - ${GAP})` : '100%'}
      />
      {state === 'overdueUnloading' && (
        <span className="absolute right-0">
          <Ring overdue />
        </span>
      )}
    </div>
  );
}

const CONNECTOR = {
  idle: { bg: STATUS_BAR.idle, border: STATUS_BORDER.idle },
  late: { bg: STATUS_BAR.late, border: STATUS_BORDER.late },
  transit: { bg: STATUS_BAR.transit, border: STATUS_BORDER.transit },
  done: { bg: STATUS_BAR.done, border: STATUS_BORDER.done },
};

/** Colour of the shared part (trunk + bar + elbows) of a fan-out / fan-in; agency: green only once all istovareno. */
function trunkColor(group: RouteGroup, fanOut: boolean, isAgency?: boolean) {
  const cargos = group.left.flatMap((point) => point.cargos);
  if (isAgency) return agencyRouteState(cargos) === 'done' ? CONNECTOR.done : CONNECTOR.idle;
  const state = routeState(cargos);
  if (state === 'done') return CONNECTOR.done;
  if (fanOut)
    return state === 'transit' || state === 'partial'
      ? CONNECTOR.transit
      : state === 'late'
        ? CONNECTOR.late
        : CONNECTOR.idle;
  return CONNECTOR.idle;
}

/** The bar piece of one branch row: first ╭, last ╰, middle ├ (borders, so the corners can be rounded). */
function Elbow({
  index,
  count,
  side,
  color,
}: {
  index: number;
  count: number;
  side: 'left' | 'right';
  color: { bg: string; border: string };
}) {
  const isFirst = index === 0;
  const isLast = index === count - 1;
  const edge = side === 'left' ? 'left-0 border-l-2' : 'right-0 border-r-2';
  if (isFirst || isLast) {
    const corner = isFirst
      ? cn('top-[calc(50%-1px)] bottom-0 border-t-2', side === 'left' ? 'rounded-tl-lg' : 'rounded-tr-lg')
      : cn('top-0 bottom-[calc(50%-1px)] border-b-2', side === 'left' ? 'rounded-bl-lg' : 'rounded-br-lg');
    return <div className={cn('absolute w-3', edge, corner, color.border)} />;
  }
  return (
    <>
      <div className={cn('absolute inset-y-0 w-3', edge, color.border)} />
      <div className={cn('absolute top-[calc(50%-1px)] h-0.5 w-3', side === 'left' ? 'left-0' : 'right-0', color.bg)} />
    </>
  );
}

/** The row's line: own = tracking (routeState), agency = the dispatcher's hand marks (agencyRouteState). */
function RowLine({ cargos, isAgency }: { cargos: TrackCargo[]; isAgency?: boolean }) {
  if (isAgency) return <AgencyTrackLine state={agencyRouteState(cargos)} />;
  return <TrackLine state={routeState(cargos)} />;
}

/** The whole cell. */
export function RouteTrack({
  cargos,
  vehicleStops,
  isAgency,
  dateFilter,
}: {
  cargos: Cargo[];
  vehicleStops?: VehicleStop[];
  isAgency?: boolean;
  dateFilter?: DateFilter;
}) {
  const groups = React.useMemo(
    () => buildGroups(cargos.map((cargo) => toTrackCargo(cargo, vehicleStops))),
    [cargos, vehicleStops]
  );
  if (!cargos.length) return <span className="text-muted-foreground">—</span>;

  return (
    // Capped: the route column takes the table's spare width, and on wide screens utovar and istovar drifted far apart.
    <DateFilterContext.Provider value={dateFilter}>
      <div className="flex max-w-[44rem] flex-col gap-3">
        {groups.map((group) => {
          const rows = groupRows(group);
          const count = rows.length;

          if (count === 1) {
            return (
              <div
                className="grid items-center gap-x-2"
                key={group.key}
                style={{ gridTemplateColumns: 'minmax(0,1fr) 4.75rem minmax(0,1fr)' }}
              >
                <Stacked isAgency={isAgency} point={rows[0].left} side="loading" />
                <RowLine cargos={rows[0].cargos} isAgency={isAgency} />
                <Stacked isAgency={isAgency} point={rows[0].right} side="unloading" />
              </div>
            );
          }

          const fanOut = group.left.length === 1;
          const trunk = trunkColor(group, fanOut, isAgency);

          return (
            <div
              className="-my-1 grid items-center gap-x-0"
              key={group.key}
              style={{
                gridTemplateColumns: fanOut
                  ? 'minmax(0,1fr) 0.75rem 4.75rem minmax(0,1fr)'
                  : 'minmax(0,1fr) 4.75rem 0.75rem minmax(0,1fr)',
              }}
            >
              {/* Shared side: place + trunk, spanning all rows (×N only for merged identical pairs). */}
              <div
                className={cn('min-w-0 py-1', fanOut ? 'pr-2' : 'pl-2')}
                style={{ gridColumn: fanOut ? 1 : 4, gridRow: `1 / span ${count}` }}
              >
                <Stacked
                  hideCount
                  isAgency={isAgency}
                  point={fanOut ? group.left[0] : group.right[0]}
                  side={fanOut ? 'loading' : 'unloading'}
                />
              </div>
              <div
                className="flex h-full items-center self-stretch"
                style={{ gridColumn: fanOut ? 2 : 3, gridRow: `1 / span ${count}` }}
              >
                <div className={cn('h-0.5 w-full', trunk.bg)} />
              </div>

              {rows.map((row, index) => (
                <React.Fragment key={index}>
                  <div
                    className="relative flex h-full items-center self-stretch"
                    style={{ gridColumn: fanOut ? 3 : 2, gridRow: index + 1 }}
                  >
                    <Elbow color={trunk} count={count} index={index} side={fanOut ? 'left' : 'right'} />
                    <div className={cn('w-full', fanOut ? 'ml-3' : 'mr-3')}>
                      <RowLine cargos={row.cargos} isAgency={isAgency} />
                    </div>
                  </div>
                  <div
                    className={cn('min-w-0 py-1', fanOut ? 'pl-2' : 'pr-2')}
                    style={{ gridColumn: fanOut ? 4 : 1, gridRow: index + 1 }}
                  >
                    <Stacked
                      isAgency={isAgency}
                      point={fanOut ? row.right : row.left}
                      side={fanOut ? 'unloading' : 'loading'}
                    />
                  </div>
                </React.Fragment>
              ))}
            </div>
          );
        })}
      </div>
    </DateFilterContext.Provider>
  );
}
