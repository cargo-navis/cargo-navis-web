import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';

import type { VehicleStop } from '@/lib/api/vehicleStops';

import { routeFacts, weekLabel } from '../routeFacts';
import { buildBlocks, buildEntries, foldedCount } from './routeEntries';

const cargo = { id: 'c', shipment: { id: 's', orderNumber: '1/2026', clientId: null } } as never;

function stop(id: string, patch: Partial<VehicleStop> = {}): VehicleStop {
  return {
    id,
    createdAt: '',
    vehicleId: 'v',
    previousStopId: null,
    address: null,
    date: null,
    driverId: 'd1',
    trailerId: null,
    disponentId: null,
    loadingCargos: [cargo],
    unloadingCargos: [],
    documents: [],
    messageSentAt: null,
    ...patch,
  };
}

const today = dayjs('2026-11-10');
const done = { completedAt: '2026-11-01T10:00:00Z' };

/** Newest first, like the API. */
const route = [
  stop('f2', { date: '2026-11-13', driverId: 'd2' }),
  stop('f1', { date: '2026-11-12', driverId: 'd2' }),
  stop('p4', { date: '2026-11-09', ...done }),
  stop('p3', { date: '2026-11-08', ...done }),
  stop('p2', { date: '2026-11-07', ...done }),
  stop('p1', { date: '2026-11-06', ...done }),
];

const shape = (entries: ReturnType<typeof buildEntries>) =>
  entries.map((entry) =>
    entry.type === 'stop' ? entry.stop.id : entry.type === 'driver' ? `driver:${entry.driverId}` : entry.type
  );

describe('buildEntries', () => {
  it('folds all but the last two finished stops', () => {
    expect(foldedCount(route)).toBe(2);
  });

  it('newest first: driver header above its run, Danas between past and future, folded ones last', () => {
    expect(shape(buildEntries(route, { today }))).toEqual([
      'driver:d2',
      'f2',
      'f1',
      'driver:d1',
      'today',
      'p4',
      'p3',
      'earlier',
    ]);
  });

  it('chronological order on request, everything shown', () => {
    expect(shape(buildEntries(route, { today, order: 'down', showEarlier: true }))).toEqual([
      'driver:d1',
      'p1',
      'p2',
      'p3',
      'p4',
      'today',
      'driver:d2',
      'f1',
      'f2',
    ]);
  });

  it('never folds an unfinished stop', () => {
    const odd = [stop('b', { date: '2026-11-12' }), stop('a', { date: '2026-11-01' })];
    expect(foldedCount(odd)).toBe(0);
  });

  it('groups runs into blocks; the „Prikaži ranije” row stays loose at the bottom', () => {
    const blocks = buildBlocks(buildEntries(route, { today }));
    expect(blocks.map((block) => (block.kind === 'run' ? `run:${block.driverId}` : 'loose'))).toEqual([
      'run:d2',
      'run:d1',
      'loose',
    ]);
  });
});

describe('routeFacts', () => {
  it('counts what needs attention on unfinished stops', () => {
    const facts = routeFacts([
      stop('c', { driverId: null }),
      stop('b', { date: '2026-11-12', messageSentAt: '2026-11-09T10:00:00Z' }),
      stop('a', { date: '2026-11-11' }),
      stop('z', { date: '2026-11-09', ...done }),
    ]);
    expect(facts.lastDone?.id).toBe('z');
    expect(facts.next?.id).toBe('a');
    expect(facts.rest).toBe(2);
    expect(facts.until).toBe('2026-11-12');
    expect(facts.noDriver).toBe(1);
    expect(facts.noDate).toBe(1);
    expect(facts.notNotified).toBe(1);
    expect(facts.driverId).toBe('d1');
  });
});

describe('weekLabel', () => {
  it('formats a week without leading zeros', () => {
    expect(weekLabel(dayjs('2026-11-09'))).toBe('9.–15.11.2026.');
    expect(weekLabel(dayjs('2026-11-30'))).toBe('30.11.–6.12.2026.');
    expect(weekLabel(dayjs('2025-12-29'))).toBe('29.12.2025.–4.1.2026.');
  });
});
