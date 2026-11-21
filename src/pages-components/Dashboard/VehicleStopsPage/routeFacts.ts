import dayjs, { type Dayjs } from 'dayjs';

import type { VehicleStop } from '@/lib/api/vehicleStops';

import { chronological, isDone } from './stops';

/** What the list shows per vehicle (lab /transports `factsOf`). `stops` = the API's order, newest first. */
export function routeFacts(stops: VehicleStop[]) {
  const ordered = chronological(stops);
  const done = ordered.filter(isDone);
  const pending = ordered.filter((stop) => !isDone(stop));
  const next = pending[0];
  const lastDone = done.at(-1);
  const dated = pending.filter((stop) => stop.date);
  return {
    lastDone,
    next,
    rest: pending.length - (next ? 1 : 0),
    until: dated.at(-1)?.date ?? null,
    noDriver: pending.filter((stop) => !stop.driverId).length,
    noDate: pending.filter((stop) => !stop.date).length,
    notNotified: pending.filter((stop) => stop.driverId && !stop.messageSentAt).length,
    driverId: next?.driverId ?? lastDone?.driverId ?? null,
  };
}

export type RouteFacts = ReturnType<typeof routeFacts>;

const DAY_NAMES = ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned'];

/** Monday of the week `date` is in. */
export function startOfWeek(date: Dayjs) {
  return date.startOf('day').subtract((date.day() + 6) % 7, 'day');
}

/** Pon–Ned of the week starting on `monday`. */
export function weekDays(monday: Dayjs) {
  return DAY_NAMES.map((name, index) => {
    const day = monday.add(index, 'day');
    return { key: day.format('YYYY-MM-DD'), name, day };
  });
}

/** „9.–15.11.2026.”, „30.11.–6.12.2026.”, „29.12.2025.–4.1.2026.”. */
export function weekLabel(monday: Dayjs) {
  const sunday = monday.add(6, 'day');
  const end = `${sunday.date()}.${sunday.month() + 1}.${sunday.year()}.`;
  if (monday.year() !== sunday.year()) return `${monday.date()}.${monday.month() + 1}.${monday.year()}.–${end}`;
  if (monday.month() !== sunday.month()) return `${monday.date()}.${monday.month() + 1}.–${end}`;
  return `${monday.date()}.–${end}`;
}

export function todayKey() {
  return dayjs().format('YYYY-MM-DD');
}
