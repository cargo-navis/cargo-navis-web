import dayjs, { type Dayjs } from 'dayjs';

import type { VehicleStop } from '@/lib/api/vehicleStops';

import { chronological, isDone } from '../stops';

/**
 * The vehicle's Ruta as rows (lab /transports `buildEntries`): stops in route order, a „Danas” line between what's done
 * and what's next, one driver header per run of stops with the same driver, and earlier finished stops folded away
 * (except the last two). Decided order = today's: newest first (`up`); chronological (`down`) is kept in code.
 */
export type Entry =
  | { type: 'stop'; stop: VehicleStop }
  | { type: 'today' }
  | { type: 'earlier'; count: number }
  | { type: 'driver'; driverId: string | null; ids: string[] };

/** How many of the oldest finished stops fold away (only finished ones, and the last two always stay). */
export function foldedCount(stopsNewestFirst: VehicleStop[]) {
  const ordered = chronological(stopsNewestFirst);
  const leadingDone = ordered.findIndex((stop) => !isDone(stop));
  const done = leadingDone === -1 ? ordered.length : leadingDone;
  return Math.max(0, done - 2);
}

export function buildEntries(
  stopsNewestFirst: VehicleStop[],
  {
    order = 'up',
    showEarlier = false,
    today = dayjs().startOf('day'),
  }: { order?: 'up' | 'down'; showEarlier?: boolean; today?: Dayjs } = {}
): Entry[] {
  const ordered = chronological(stopsNewestFirst);
  const hidden = showEarlier ? 0 : foldedCount(stopsNewestFirst);
  const visible = ordered.slice(hidden);
  const entries: Entry[] = [];
  if (hidden > 0) entries.push({ type: 'earlier', count: hidden });
  let todayPlaced = false;
  let currentDriver: string | null | undefined;
  let run: Extract<Entry, { type: 'driver' }> | undefined;
  for (const stop of visible) {
    const isFuture = stop.date ? dayjs(stop.date).startOf('day').isAfter(today) : !isDone(stop);
    if (!todayPlaced && isFuture) {
      entries.push({ type: 'today' });
      todayPlaced = true;
    }
    // One driver header per run of stops with the same driver (today the driver is repeated on every stop).
    if (!run || stop.driverId !== currentDriver) {
      run = { type: 'driver', driverId: stop.driverId, ids: [] };
      entries.push(run);
      currentDriver = stop.driverId;
    }
    run.ids.push(stop.id);
    entries.push({ type: 'stop', stop });
  }
  if (!todayPlaced) entries.push({ type: 'today' });
  if (order === 'down') return entries;

  // Newest first: reverse, keeping each driver header above its run.
  const groups: Entry[][] = [];
  for (const entry of entries) {
    if (entry.type === 'driver' || groups.length === 0) groups.push([entry]);
    else groups[groups.length - 1].push(entry);
  }
  return groups.reverse().flatMap((group) => {
    const [head, ...rest] = group;
    return head.type === 'driver' ? [head, ...rest.reverse()] : [...group].reverse();
  });
}

/** A driver's run (header + its rows) or a loose row (the „Prikaži ranije” button, anything before the first run). */
export type Block =
  | { kind: 'loose'; entry: Entry }
  | { kind: 'run'; driverId: string | null; ids: string[]; entries: Entry[] };

export function buildBlocks(entries: Entry[]): Block[] {
  const blocks: Block[] = [];
  for (const entry of entries) {
    const last = blocks[blocks.length - 1];
    if (entry.type === 'driver') blocks.push({ kind: 'run', driverId: entry.driverId, ids: entry.ids, entries: [] });
    else if (entry.type === 'earlier' || last?.kind !== 'run') blocks.push({ kind: 'loose', entry });
    else last.entries.push(entry);
  }
  return blocks;
}
