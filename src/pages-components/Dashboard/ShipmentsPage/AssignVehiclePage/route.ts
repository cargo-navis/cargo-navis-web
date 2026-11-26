/**
 * What a vehicle looks like against the nalog being assigned (lab /assign `fitOf`, `timelineOf`): where it will be on
 * the loading day, what it already has on the new stops' days, and its route with the new stops slotted in by date.
 * Vehicle stops come from getVehicleStopsByVehicle: every unfinished stop + the last 5 finished ones per vehicle (the
 * backend ignores `limitPerVehicle`), so everything from today on is always there.
 */

import dayjs from 'dayjs';

import type { StopKind } from '@/components/shared/stop-kind';
import type { VehicleStop } from '@/lib/api/vehicleStops';
import { isStopCompleted } from '@/lib/utils/vehicleStops';

/** One stop of the nalog on this page: an address with its date (prefilled, editable). */
export interface NewStop {
  key: string;
  kinds: StopKind[];
  /** 'YYYY-MM-DD' or null when not picked yet. */
  date: string | null;
}

export const dayOf = (date: string | null | undefined) => (date ? dayjs(date).format('YYYY-MM-DD') : null);

/** Utovar and / or istovar at this stop (a stop can be both). */
export function stopKinds(stop: Pick<VehicleStop, 'loadingCargos' | 'unloadingCargos'>): StopKind[] {
  const kinds: StopKind[] = [];
  if (stop.loadingCargos?.length) kinds.push('loading');
  if (stop.unloadingCargos?.length) kinds.push('unloading');
  return kinds.length ? kinds : ['unloading'];
}

/** The vehicle's stops oldest → newest by date (undated last), keeping the API's order within a day. */
export function chronological(stops: VehicleStop[]): VehicleStop[] {
  return [...stops].reverse().sort((a, b) => {
    const dayA = dayOf(a.date);
    const dayB = dayOf(b.date);
    if (!dayA && !dayB) return 0;
    if (!dayA) return 1;
    if (!dayB) return -1;
    return dayA.localeCompare(dayB);
  });
}

export function fitOf(stops: VehicleStop[], newStops: NewStop[], today: string) {
  const loadingDays = newStops
    .filter((stop) => stop.kinds.includes('loading') && stop.date)
    .map((stop) => stop.date!)
    .sort();
  const loadDay = loadingDays[0] ?? today;
  const newDays = new Set(newStops.map((stop) => stop.date).filter(Boolean));
  const dated = chronological(stops).filter((stop) => dayOf(stop.date));
  // Its last stop on or before the loading day: where it will (roughly) be.
  const where = dated.filter((stop) => dayOf(stop.date)! <= loadDay).at(-1);
  const conflicts = dated.filter((stop) => !isStopCompleted(stop) && newDays.has(dayOf(stop.date)));
  return { loadDay, where, conflicts };
}

export type TimelineItem =
  | { type: 'stop'; stop: VehicleStop; clash: boolean }
  | { type: 'new'; stop: NewStop }
  | { type: 'today'; date: string }
  /** Later stops folded away (expand in place). */
  | { type: 'more'; count: number }
  /** Older stops exist but get no row: the line fades out (the history only grows). */
  | { type: 'history' };

/**
 * The route around the new stops (lab /assign „Prozor”, 2026-11-26), oldest → newest: 2 stops before the first new
 * date (where it comes from), every stop between the first and last new date (incl. „Isti dan”), 1 after (where it
 * goes next); later ones fold into `more` (all with `showAllLater`), older ones into `history`. No new dates: around
 * today (last finished + next 3 planned). „Danas” only inside the window. Undated stops count as the latest.
 */
export function timelineOf(
  stops: VehicleStop[],
  newStops: NewStop[],
  today: string,
  showAllLater = false
): TimelineItem[] {
  const ordered = chronological(stops);
  const clashDays = new Set(fitOf(stops, newStops, today).conflicts.map((stop) => dayOf(stop.date)));
  const newDays = newStops
    .map((stop) => stop.date)
    .filter((date): date is string => !!date)
    .sort();

  let before: VehicleStop[], within: VehicleStop[], after: VehicleStop[];
  let keepBefore: number, keepAfter: number;
  if (newDays.length) {
    const [first, last] = [newDays[0], newDays[newDays.length - 1]];
    const day = (stop: VehicleStop) => dayOf(stop.date);
    before = ordered.filter((stop) => day(stop) && day(stop)! < first);
    within = ordered.filter((stop) => day(stop) && day(stop)! >= first && day(stop)! <= last);
    after = ordered.filter((stop) => !day(stop) || day(stop)! > last);
    [keepBefore, keepAfter] = [2, 1];
  } else {
    before = ordered.filter(isStopCompleted);
    within = [];
    after = ordered.filter((stop) => !isStopCompleted(stop));
    [keepBefore, keepAfter] = [1, 3];
  }
  const shownBefore = before.slice(-keepBefore);
  const shownAfter = showAllLater ? after : after.slice(0, keepAfter);
  const shown = [...shownBefore, ...within, ...shownAfter];

  const FAR = '9999-12-31';
  const days = [...shown.map((stop) => dayOf(stop.date)).filter((date): date is string => !!date), ...newDays].sort();
  const showToday = days.length > 0 && today >= days[0] && today <= days[days.length - 1];
  const entries: { day: string; order: number; item: TimelineItem }[] = [
    ...shown.map((stop, index) => ({
      day: dayOf(stop.date) ?? FAR,
      order: index,
      item: { type: 'stop', stop, clash: !isStopCompleted(stop) && clashDays.has(dayOf(stop.date)) } as TimelineItem,
    })),
    ...newStops
      .filter((stop) => stop.date)
      .map((stop, index) => ({ day: stop.date!, order: 1000 + index, item: { type: 'new', stop } as TimelineItem })),
    ...(showToday ? [{ day: today, order: 500, item: { type: 'today', date: today } as TimelineItem }] : []),
  ];
  const later = after.length - shownAfter.length;
  return [
    ...(before.length > shownBefore.length ? [{ type: 'history' } as TimelineItem] : []),
    ...entries.sort((a, b) => a.day.localeCompare(b.day) || a.order - b.order).map((entry) => entry.item),
    ...(later > 0 ? [{ type: 'more', count: later } as TimelineItem] : []),
  ];
}
