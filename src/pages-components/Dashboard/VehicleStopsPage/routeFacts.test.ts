import dayjs from 'dayjs';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { VehicleStop } from '@/lib/api/vehicleStops';

import { pickTimeline, routeFacts, startOfWeek, todayKey, weekDays, weekLabel } from './routeFacts';

// The basic routeFacts / pickTimeline / weekLabel cases live in VehicleStopDetailPage/routeEntries.test.ts.

const stop = (id: string, overrides: Partial<VehicleStop> = {}): VehicleStop => ({
  id,
  createdAt: '',
  vehicleId: 'v',
  previousStopId: null,
  address: null,
  date: null,
  driverId: 'd1',
  trailerId: null,
  disponentId: null,
  loadingCargos: [],
  unloadingCargos: [],
  documents: [],
  messageSentAt: null,
  ...overrides,
});

const done = { completedAt: '2026-11-01T10:00:00Z' };
const ids = (stops: VehicleStop[]) => stops.map((value) => value.id);

describe('routeFacts', () => {
  it('handles a vehicle without stops', () => {
    expect(routeFacts([])).toEqual({
      lastDone: undefined,
      next: undefined,
      rest: 0,
      until: null,
      noDriver: 0,
      noDate: 0,
      notNotified: 0,
      driverId: null,
    });
  });

  it('takes the driver of the last finished stop when all are finished', () => {
    const facts = routeFacts([stop('b', { ...done, driverId: 'd2' }), stop('a', { ...done })]);
    expect(facts.lastDone?.id).toBe('b');
    expect(facts.next).toBeUndefined();
    expect(facts.rest).toBe(0);
    expect(facts.driverId).toBe('d2');
  });

  it('falls back to the last finished driver when the next stop has none', () => {
    expect(routeFacts([stop('b', { driverId: null }), stop('a', { ...done, driverId: 'd3' })]).driverId).toBe('d3');
  });

  it('ignores finished stops in the counts', () => {
    const facts = routeFacts([stop('a', { ...done, driverId: null, date: '2026-11-20' })]);
    expect(facts).toMatchObject({ noDriver: 0, noDate: 0, notNotified: 0, until: null });
  });

  it('runs until the last dated stop in route order', () => {
    // Newest first: the undated newest stop does not move „until”.
    const facts = routeFacts([stop('c'), stop('b', { date: '2026-11-14' }), stop('a', { date: '2026-11-12' })]);
    expect(facts.until).toBe('2026-11-14');
    expect(facts.next?.id).toBe('a');
    expect(facts.rest).toBe(2);
  });
});

describe('pickTimeline', () => {
  const route = (doneCount: number, length: number) =>
    Array.from({ length }, (_, index) => stop(`s${index}`, index < doneCount ? done : {}));

  it('starts at the beginning when nothing is finished', () => {
    const { shown, more } = pickTimeline(route(0, 7));
    expect(ids(shown)).toEqual(['s0', 's1', 's2', 's3', 's4']);
    expect(more).toBe(2);
  });

  it('fills up with earlier stops when the route is almost done', () => {
    const { shown, more } = pickTimeline(route(6, 7));
    expect(ids(shown)).toEqual(['s2', 's3', 's4', 's5', 's6']);
    expect(more).toBe(0);
  });

  it('shows the last finished ones when all are finished', () => {
    const { shown, more } = pickTimeline(route(7, 7));
    expect(ids(shown)).toEqual(['s2', 's3', 's4', 's5', 's6']);
    expect(more).toBe(0);
  });

  it('shows a short route whole', () => {
    expect(pickTimeline(route(1, 3))).toEqual({ shown: route(1, 3), more: 0 });
    expect(pickTimeline([])).toEqual({ shown: [], more: 0 });
  });

  it('takes a custom size', () => {
    const { shown, more } = pickTimeline(route(2, 7), 3);
    expect(ids(shown)).toEqual(['s1', 's2', 's3']);
    expect(more).toBe(3);
  });
});

describe('week helpers', () => {
  it.each([
    ['2026-11-09', '2026-11-09'],
    ['2026-11-12', '2026-11-09'],
    ['2026-11-15', '2026-11-09'],
    ['2026-01-01', '2025-12-29'],
  ])('week of %s starts on %s', (day, monday) => expect(startOfWeek(dayjs(day)).format('YYYY-MM-DD')).toBe(monday));

  it('drops the time of day', () => {
    expect(startOfWeek(dayjs(new Date(2026, 10, 11, 17, 30))).toDate()).toEqual(new Date(2026, 10, 9));
  });

  it('lists Pon–Ned across a month change', () => {
    expect(weekDays(dayjs('2026-11-30')).map(({ key, name }) => `${name} ${key}`)).toEqual([
      'Pon 2026-11-30',
      'Uto 2026-12-01',
      'Sri 2026-12-02',
      'Čet 2026-12-03',
      'Pet 2026-12-04',
      'Sub 2026-12-05',
      'Ned 2026-12-06',
    ]);
  });

  it('labels a week across a month in the same year', () => {
    expect(weekLabel(dayjs('2026-03-30'))).toBe('30.3.–5.4.2026.');
  });
});

describe('todayKey', () => {
  afterEach(() => vi.useRealTimers());

  it('is the local day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 16, 23, 59));
    expect(todayKey()).toBe('2026-06-16');
  });
});
