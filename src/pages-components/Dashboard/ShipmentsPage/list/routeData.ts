/**
 * The route data shared by the table's route track (RouteTrack) and the quick look's timeline (RouteStops): each cargo
 * reduced to its loading / unloading place, dates and load status, the cargos' stops in date order, and the progress
 * rules both use (so a nalog shows the same state in the table row and in the sheet): unloaded = done (green ✓),
 * loaded = on the way (blue truck), still not loaded past its ready date = late (red), otherwise waiting (grey).
 */

import type { Cargo, VehicleStop } from '@/lib/api';
import { LoadStatus } from '@/lib/api/shipments';
import { DateTimeFormat, daysFromToday, formatDateString } from '@/lib/utils/date';

export interface Place {
  countryCode: string | null;
  postalCode: string | null;
  placeName: string | null;
}

export interface TrackCargo {
  id: string;
  from: Place | null;
  readyDate: string | null;
  to: Place | null;
  dueDate: string | null;
  status: LoadStatus;
}

/** Same place = same country + postal code (the name can be spelled differently per cargo). */
export const placeKey = (place: Place | null) => (place ? `${place.countryCode ?? ''}-${place.postalCode ?? ''}` : '—');

/**
 * The cargo's own dates (ready / due), else the date planned on the vehicle stop that loads / unloads it: Dodijeli
 * vozilo writes its dates only to the new vehicle stops, so a nalog created without dates would otherwise stay undated.
 */
export function toTrackCargo(cargo: Cargo, vehicleStops: VehicleStop[] = []): TrackCargo {
  const plannedDate = (side: 'loadingCargos' | 'unloadingCargos') =>
    vehicleStops.find((stop) => stop[side]?.some((item) => item.id === cargo.id))?.date ?? null;
  const place = (address: Cargo['loadingAddress'] | null | undefined): Place | null =>
    address
      ? {
          countryCode: address.countryCode || null,
          postalCode: address.postalCode || null,
          placeName: address.placeName,
        }
      : null;
  return {
    id: cargo.id,
    from: place(cargo.loadingAddress),
    readyDate: cargo.loadingReadyDate ?? plannedDate('loadingCargos'),
    to: place(cargo.unloadingAddress),
    dueDate: cargo.unloadingDueDate ?? plannedDate('unloadingCargos'),
    status: cargo.loadStatus ?? LoadStatus.NotYetLoaded,
  };
}

/** Progress of a set of cargos (a table row): every cargo unloaded / every loaded / some loaded / none. */
export type RouteState = 'waiting' | 'late' | 'partial' | 'transit' | 'lateUnloading' | 'done';

export const isPast = (date: string | null, now: Date = new Date()) => !!date && daysFromToday(date, now) < 0;

const isLoaded = (cargo: TrackCargo) => cargo.status !== LoadStatus.NotYetLoaded;

/** The table's late rule: still not loaded after its ready date („Kasni utovar”). */
const isLateLoading = (cargo: TrackCargo, now: Date) => !isLoaded(cargo) && isPast(cargo.readyDate, now);

/** Loaded but still not unloaded after its due date („Kasni istovar”). */
export const isLateUnloading = (cargo: TrackCargo, now: Date = new Date()) =>
  isLoaded(cargo) && cargo.status !== LoadStatus.Unloaded && isPast(cargo.dueDate, now);

/**
 * The table row's state: a loaded cargo past its due date is `lateUnloading`; nothing loaded is late once a ready
 * date has passed, else waiting.
 */
export function routeState(cargos: TrackCargo[], now: Date = new Date()): RouteState {
  if (cargos.every((cargo) => cargo.status === LoadStatus.Unloaded)) return 'done';
  if (cargos.some((cargo) => isLateUnloading(cargo, now))) return 'lateUnloading';
  if (cargos.every(isLoaded)) return 'transit';
  if (cargos.some(isLoaded)) return 'partial';
  return cargos.some((cargo) => isPast(cargo.readyDate, now)) ? 'late' : 'waiting';
}

export type RouteStopKind = 'loading' | 'unloading';

/**
 * done = every cargo there done; the next stop (first not done) is `transit` (the vehicle is on its way: some cargo of
 * the nalog already loaded, as the table's blue truck), `late` (a cargo there still not loaded after its ready date, as
 * the table's red „Kasni utovar”; wins over transit) or `waiting` (neither); the stops after it are `planned`.
 */
export type RouteStopState = 'done' | 'transit' | 'late' | 'waiting' | 'planned';

export interface RouteStop {
  key: string;
  kind: RouteStopKind;
  place: Place | null;
  /** The first cargo's date (ISO), null when none is set. */
  date: string | null;
  /** Local calendar day „YYYY-MM-DD” (grouping, ordering), null without a date. */
  day: string | null;
  cargos: TrackCargo[];
  /** Utovar: every cargo loaded (or already unloaded); istovar: every cargo unloaded. */
  done: boolean;
  state: RouteStopState;
  /** Days past the latest missed ready date when `late`, else 0. */
  daysLate: number;
}

const dayOf = (date: string | null) => (date ? formatDateString(date, DateTimeFormat.IsoShort) : null);

/**
 * One stop per utovar / istovar: cargos loaded (or unloaded) at the same place on the same day share a stop. Ordered by
 * day (undated last), then as the data gives them: utovari in cargo order, then istovari in cargo order.
 */
export function buildRouteStops(cargos: TrackCargo[], now: Date = new Date()): RouteStop[] {
  const stops = new Map<string, RouteStop>();
  const add = (kind: RouteStopKind, cargo: TrackCargo) => {
    const place = kind === 'loading' ? cargo.from : cargo.to;
    const date = kind === 'loading' ? cargo.readyDate : cargo.dueDate;
    const day = dayOf(date);
    const key = `${kind}|${placeKey(place)}|${day ?? ''}`;
    const stop = stops.get(key);
    if (stop) stop.cargos.push(cargo);
    else stops.set(key, { key, kind, place, date, day, cargos: [cargo], done: false, state: 'planned', daysLate: 0 });
  };
  cargos.forEach((cargo) => add('loading', cargo));
  cargos.forEach((cargo) => add('unloading', cargo));

  const sorted = [...stops.values()]
    .map((stop) => ({
      ...stop,
      done: stop.cargos.every((cargo) =>
        stop.kind === 'loading' ? isLoaded(cargo) : cargo.status === LoadStatus.Unloaded
      ),
    }))
    .sort((a, b) => {
      if (a.day && b.day) return a.day.localeCompare(b.day);
      return a.day ? -1 : b.day ? 1 : 0;
    });

  return withProgress(sorted, {
    started: cargos.some(isLoaded),
    daysLate: (stop) => {
      const loading = stop.kind === 'loading';
      const late = stop.cargos.filter((cargo) => (loading ? isLateLoading(cargo, now) : isLateUnloading(cargo, now)));
      return late.length
        ? Math.max(...late.map((cargo) => -daysFromToday((loading ? cargo.readyDate : cargo.dueDate) as string, now)))
        : 0;
    },
  });
}

/**
 * The progress rule of a route already in driving order (the quick look's stops and the Nalog detail's vehicle stops):
 * done stops `done`; the first not done is `late` (daysLate > 0, wins), `transit` (the nalog has started) or `waiting`;
 * the stops after it `planned`.
 */
export function withProgress<T extends { done: boolean }>(
  stops: T[],
  { started, daysLate }: { started: boolean; daysLate(stop: T): number }
): (T & { state: RouteStopState; daysLate: number })[] {
  const nextIndex = stops.findIndex((stop) => !stop.done);
  return stops.map((stop, index) => {
    if (stop.done) return { ...stop, state: 'done', daysLate: 0 };
    if (index !== nextIndex) return { ...stop, state: 'planned', daysLate: 0 };
    const late = daysLate(stop);
    if (late > 0) return { ...stop, state: 'late', daysLate: late };
    return { ...stop, state: started ? 'transit' : 'waiting', daysLate: 0 };
  });
}

// ---------------------------------------------------------------------------------------------------------------------
// Own nalozi with a vehicle (Nalog detail „Ruta”): one row per vehicle stop — what the dispatcher confirms („✓ Potvrdi
// utovar / istovar” completes the vehicle stop) — so the done state is the stop's `completedAt`, never the cargo
// status, and the confirm button always sits on the first stop that isn't done.
// ---------------------------------------------------------------------------------------------------------------------

/** The nalog's vehicle stops in driving order: planned date ascending (no date last), then by creation. */
export function sortStops(stops: VehicleStop[]) {
  return [...stops].sort((a, b) => {
    if (a.date && b.date && a.date !== b.date) return a.date.localeCompare(b.date);
    if (!a.date !== !b.date) return a.date ? -1 : 1;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

export interface VehicleRouteStop {
  key: string;
  stop: VehicleStop;
  /** Utovar and / or istovar of THIS nalog's tereti (a stop can carry other nalozi too). */
  kinds: RouteStopKind[];
  /** This nalog's tereti loaded / unloaded here, in the nalog's order. */
  loadingIds: string[];
  unloadingIds: string[];
  done: boolean;
  state: RouteStopState;
  /** Days past the stop's planned date when `late`, else 0. */
  daysLate: number;
  /** Why the stop can't be confirmed / undone now (the backend's rules, checked up front), else undefined. */
  blocked?: string;
}

/** The same rules the backend enforces on complete / uncomplete. */
export function vehicleStopBlockedReason(stop: VehicleStop, stops: VehicleStop[]) {
  if (!stop.completedAt) {
    const notLoaded = stop.unloadingCargos.some((cargo) =>
      stops.some(
        (other) =>
          other.id !== stop.id && !other.completedAt && other.loadingCargos.some((item) => item.id === cargo.id)
      )
    );
    if (notLoaded) return 'Prvo potvrdi utovar ovog tereta.';
  } else {
    const laterDone = stop.loadingCargos.some((cargo) =>
      stops.some(
        (other) =>
          other.id !== stop.id && !!other.completedAt && other.unloadingCargos.some((item) => item.id === cargo.id)
      )
    );
    if (laterDone) return 'Teret je već istovaren. Prvo poništi taj istovar.';
  }
  return undefined;
}

/**
 * The nalog's vehicle stops with the quick look's states (withProgress): done = completed; the next one late once its
 * planned date passed, on its way once an earlier stop is done, else waiting.
 */
export function buildVehicleRouteStops(
  vehicleStops: VehicleStop[],
  cargoIds: string[],
  now: Date = new Date()
): VehicleRouteStop[] {
  const order = new Map(cargoIds.map((id, index) => [id, index]));
  const own = (items: { id: string }[]) =>
    items
      .map((item) => item.id)
      .filter((id, index, all) => order.has(id) && all.indexOf(id) === index)
      .sort((a, b) => order.get(a)! - order.get(b)!);
  const sorted = sortStops(vehicleStops)
    .map((stop) => {
      const loadingIds = own(stop.loadingCargos);
      const unloadingIds = own(stop.unloadingCargos);
      const kinds: RouteStopKind[] = [
        ...(loadingIds.length ? (['loading'] as const) : []),
        ...(unloadingIds.length ? (['unloading'] as const) : []),
      ];
      return { key: stop.id, stop, kinds, loadingIds, unloadingIds, done: !!stop.completedAt };
    })
    .filter((row) => row.kinds.length > 0);

  return withProgress(sorted, {
    started: sorted.some((row) => row.done),
    daysLate: (row) => (isPast(row.stop.date, now) ? -daysFromToday(row.stop.date as string, now) : 0),
  }).map((row) => ({ ...row, blocked: vehicleStopBlockedReason(row.stop, vehicleStops) }));
}

// ---------------------------------------------------------------------------------------------------------------------
// Agency nalozi (labs /quick-look „Nalog: Agencijski”, /order-route, decided 2026-11-19): no vehicle, no driver app, the
// kontraktor reports nothing — the only status is the dispatcher's hand mark per teret (Nije utovaren → Utovaren →
// Istovaren). Never shown as tracking: no late (red „Kasni”), no transit (blue truck). Marked = green ✓; not marked
// once its date passed = overdue (amber „Rok prošao · označi status”); otherwise planned (grey).
// ---------------------------------------------------------------------------------------------------------------------

export type AgencyStopState = 'marked' | 'overdue' | 'planned';

export interface AgencyRouteStop extends Omit<RouteStop, 'state' | 'daysLate'> {
  state: AgencyStopState;
}

/** A teret marked for this side: utovar = loaded (or already unloaded), istovar = unloaded. */
const isMarked = (cargo: TrackCargo, kind: RouteStopKind) =>
  kind === 'loading' ? isLoaded(cargo) : cargo.status === LoadStatus.Unloaded;

/** Same stops (grouping, order, `done` = every teret there marked) as own nalozi, with the hand-marked states. */
export function buildAgencyRouteStops(cargos: TrackCargo[], now: Date = new Date()): AgencyRouteStop[] {
  return buildRouteStops(cargos, now).map(({ state: _state, daysLate: _daysLate, ...stop }) => ({
    ...stop,
    state: stop.done ? 'marked' : isPast(stop.date, now) ? 'overdue' : 'planned',
  }));
}

/**
 * The tereti to change when the dispatcher marks a stop („Označi utovareno / istovareno”) or undoes it („Vrati na Nije
 * utovaren / Utovaren”). Istovareno also covers tereti never marked utovareno; tereti already there are left out.
 */
export function agencyStopChanges(
  stop: Pick<RouteStop, 'kind' | 'cargos'>,
  undo = false
): { cargoId: string; status: LoadStatus }[] {
  const change = (status: LoadStatus, when: (cargo: TrackCargo) => boolean) =>
    stop.cargos.filter(when).map((cargo) => ({ cargoId: cargo.id, status }));
  if (stop.kind === 'loading')
    return undo
      ? change(LoadStatus.NotYetLoaded, (cargo) => cargo.status === LoadStatus.Loaded)
      : change(LoadStatus.Loaded, (cargo) => cargo.status === LoadStatus.NotYetLoaded);
  return undo
    ? change(LoadStatus.Loaded, (cargo) => cargo.status === LoadStatus.Unloaded)
    : change(LoadStatus.Unloaded, (cargo) => cargo.status !== LoadStatus.Unloaded);
}

/** A utovar can't go back to „Nije utovaren” while one of its tereti is marked istovaren (undo the istovar first). */
export const agencyUndoBlocked = (stop: Pick<RouteStop, 'kind' | 'cargos'>) =>
  stop.kind === 'loading' && stop.cargos.some((cargo) => cargo.status === LoadStatus.Unloaded);

/** One end of the table's route track (a utovar or istovar place) for an agency nalog, and how many tereti are marked. */
export function agencyEndpointState(
  cargos: TrackCargo[],
  kind: RouteStopKind,
  now: Date = new Date()
): { state: AgencyStopState; marked: number } {
  const marked = cargos.filter((cargo) => isMarked(cargo, kind)).length;
  if (marked === cargos.length) return { state: 'marked', marked };
  const overdue = cargos.some(
    (cargo) => !isMarked(cargo, kind) && isPast(kind === 'loading' ? cargo.readyDate : cargo.dueDate, now)
  );
  return { state: overdue ? 'overdue' : 'planned', marked };
}

/**
 * A table row of an agency nalog: `done` every teret istovaren (green, as own nalozi); `overdueLoading` /
 * `overdueUnloading` a teret not marked utovaren / istovaren after its date (amber); `loaded` every teret marked
 * utovaren (✓ at the utovar, the line stays grey: nobody tracks the vehicle); else `planned`.
 */
export type AgencyRouteState = 'done' | 'loaded' | 'overdueLoading' | 'overdueUnloading' | 'planned';

export function agencyRouteState(cargos: TrackCargo[], now: Date = new Date()): AgencyRouteState {
  if (cargos.every((cargo) => cargo.status === LoadStatus.Unloaded)) return 'done';
  if (cargos.some((cargo) => !isLoaded(cargo) && isPast(cargo.readyDate, now))) return 'overdueLoading';
  if (cargos.some((cargo) => cargo.status !== LoadStatus.Unloaded && isPast(cargo.dueDate, now)))
    return 'overdueUnloading';
  return cargos.every(isLoaded) ? 'loaded' : 'planned';
}
