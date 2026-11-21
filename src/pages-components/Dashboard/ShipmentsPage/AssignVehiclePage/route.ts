/**
 * What a vehicle looks like against the nalog being assigned (lab /assign `fitOf`, `timelineOf`): where it will be on
 * the loading day, what it already has on the new stops' days, and its route with the new stops slotted in by date.
 * Vehicle stops come from getVehicleStopsByVehicle (newest first, today's AssignVehicleModal data).
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
  | { type: 'today'; date: string };

/** Last 3 finished stops for context, every planned one, the new ones and „Danas”, by date. */
export function timelineOf(stops: VehicleStop[], newStops: NewStop[], today: string): TimelineItem[] {
  const ordered = chronological(stops);
  const done = ordered.filter(isStopCompleted).slice(-3);
  const pending = ordered.filter((stop) => !isStopCompleted(stop));
  const clashDays = new Set(fitOf(stops, newStops, today).conflicts.map((stop) => dayOf(stop.date)));
  const FAR = '9999-12-31';
  const entries: { day: string; order: number; item: TimelineItem }[] = [
    ...[...done, ...pending].map((stop, index) => ({
      day: dayOf(stop.date) ?? FAR,
      order: index,
      item: { type: 'stop', stop, clash: !isStopCompleted(stop) && clashDays.has(dayOf(stop.date)) } as TimelineItem,
    })),
    ...newStops
      .filter((stop) => stop.date)
      .map((stop, index) => ({ day: stop.date!, order: 1000 + index, item: { type: 'new', stop } as TimelineItem })),
    { day: today, order: 500, item: { type: 'today', date: today } },
  ];
  return entries.sort((a, b) => a.day.localeCompare(b.day) || a.order - b.order).map((entry) => entry.item);
}
