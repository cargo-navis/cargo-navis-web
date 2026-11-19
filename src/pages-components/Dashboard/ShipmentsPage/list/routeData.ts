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

  const nextIndex = sorted.findIndex((stop) => !stop.done);
  const started = cargos.some(isLoaded);
  return sorted.map((stop, index) => {
    if (stop.done) return { ...stop, state: 'done' };
    if (index !== nextIndex) return { ...stop, state: 'planned' };
    const loading = stop.kind === 'loading';
    const late = stop.cargos.filter((cargo) => (loading ? isLateLoading(cargo, now) : isLateUnloading(cargo, now)));
    if (late.length)
      return {
        ...stop,
        state: 'late',
        daysLate: Math.max(
          ...late.map((cargo) => -daysFromToday((loading ? cargo.readyDate : cargo.dueDate) as string, now))
        ),
      };
    return { ...stop, state: started ? 'transit' : 'waiting' };
  });
}
