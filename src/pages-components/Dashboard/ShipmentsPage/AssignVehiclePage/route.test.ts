import { describe, expect, it } from 'vitest';

import type { Cargo } from '@/lib/api';
import type { VehicleStop } from '@/lib/api/vehicleStops';

import { buildAssignStops, cargoStopDatesFor, defaultStopDates, getAssignStopDates } from '../list/assignStops';
import { chronological, fitOf, type NewStop, timelineOf } from './route';

const TODAY = '2026-11-10';
const cargoRef = [{ shipment: { id: 'x', orderNumber: '2052/2026', clientId: null } }];

const stop = (id: string, date: string | null, kind: 'loading' | 'unloading', done = false, place = 'Zagreb') =>
  ({
    id,
    date,
    completedAt: done ? `${date}T10:00:00Z` : undefined,
    address: { placeName: place, postalCode: '10000', countryCode: 'HR', postalCodeId: 'p', streetName: 's' },
    loadingCargos: kind === 'loading' ? cargoRef : [],
    unloadingCargos: kind === 'unloading' ? cargoRef : [],
  }) as unknown as VehicleStop;

// API order: newest first.
const STOPS = [
  stop('s5', '2026-11-12', 'loading', false, 'Wien'),
  stop('s4', '2026-11-11', 'unloading', false, 'Wien'),
  stop('s3', '2026-11-09', 'loading', true, 'Koprivnica'),
  stop('s2', '2026-11-07', 'unloading', true, 'München'),
  stop('s1', '2026-11-06', 'loading', true),
  stop('s0', '2026-11-05', 'unloading', true),
];

const NEW: NewStop[] = [
  { key: 'a', kinds: ['loading'], date: '2026-11-11' },
  { key: 'b', kinds: ['unloading'], date: '2026-11-13' },
];

describe('Dodijeli vozilo · route', () => {
  it('orders a vehicle’s stops by date, undated last', () => {
    expect(chronological([stop('u', null, 'loading'), ...STOPS]).map((item) => item.id)).toEqual([
      's0',
      's1',
      's2',
      's3',
      's4',
      's5',
      'u',
    ]);
  });

  it('says where the vehicle is on the loading day and what it already has then', () => {
    const { loadDay, where, conflicts } = fitOf(STOPS, NEW, TODAY);
    expect(loadDay).toBe('2026-11-11');
    expect(where?.id).toBe('s4');
    expect(conflicts.map((item) => item.id)).toEqual(['s4']);
  });

  /** The timeline as ids: stop ids, new-<key>, today, more-<n>, history. */
  const ids = (items: ReturnType<typeof timelineOf>) =>
    items.map((item) =>
      item.type === 'stop'
        ? item.stop.id
        : item.type === 'new'
          ? `new-${item.stop.key}`
          : item.type === 'more'
            ? `more-${item.count}`
            : item.type
    );

  it('window: 2 before the new dates, all between them, a Danas line; older ones fade out', () => {
    const items = timelineOf(STOPS, NEW, TODAY);
    expect(ids(items)).toEqual(['history', 's2', 's3', 'today', 's4', 'new-a', 's5', 'new-b']);
    expect(items.find((item) => item.type === 'stop' && item.stop.id === 's4')).toMatchObject({ clash: true });
  });

  // A busy vehicle: planned work after the new dates.
  const BUSY = [
    stop('u', null, 'loading'),
    stop('p4', '2026-11-20', 'unloading'),
    stop('p3', '2026-11-18', 'loading'),
    stop('p2', '2026-11-16', 'unloading'),
    stop('p1', '2026-11-14', 'loading'),
    ...STOPS,
  ];

  it('window: 1 after the new dates, the rest (undated too) folded into „+ N kasnijih”', () => {
    expect(ids(timelineOf(BUSY, NEW, TODAY))).toEqual([
      'history',
      's2',
      's3',
      'today',
      's4',
      'new-a',
      's5',
      'new-b',
      'p1',
      'more-4',
    ]);
  });

  it('„+ N kasnijih” opened: every later stop, undated last', () => {
    expect(ids(timelineOf(BUSY, NEW, TODAY, true)).slice(-6)).toEqual(['new-b', 'p1', 'p2', 'p3', 'p4', 'u']);
  });

  it('Danas only inside the window', () => {
    const later: NewStop[] = [{ key: 'z', kinds: ['loading'], date: '2026-11-18' }];
    expect(ids(timelineOf(BUSY, later, TODAY))).toEqual(['history', 'p1', 'p2', 'p3', 'new-z', 'p4', 'more-1']);
  });

  it('no new dates: around today (last finished + next 3 planned)', () => {
    const undated: NewStop[] = [{ key: 'a', kinds: ['loading'], date: null }];
    expect(ids(timelineOf(BUSY, undated, TODAY))).toEqual(['history', 's3', 'today', 's4', 's5', 'p1', 'more-4']);
  });

  it('a small route: nothing folded', () => {
    const two = [stop('s5', '2026-11-12', 'loading'), stop('s4', '2026-11-11', 'unloading')];
    expect(ids(timelineOf(two, NEW, TODAY))).toEqual(['s4', 'new-a', 's5', 'new-b']);
  });
});

describe('Dodijeli vozilo · stops of the nalog', () => {
  const address = (id: string) => ({
    postalCodeId: id,
    streetName: `Ulica ${id}`,
    postalCode: id,
    placeName: id,
    countryCode: 'HR',
  });
  const cargos = [
    {
      id: 'c1',
      loadingAddress: address('A'),
      unloadingAddress: address('B'),
      loadingReadyDate: '2026-11-12',
      unloadingDueDate: '2026-11-14',
    },
    {
      id: 'c2',
      loadingAddress: address('A'),
      unloadingAddress: address('C'),
      loadingReadyDate: '2026-11-11',
      unloadingDueDate: '2026-11-13',
    },
  ] as unknown as Cargo[];

  it('merges cargos by address, earliest date, loading stops first', () => {
    const stops = buildAssignStops(cargos);
    expect(stops.map((item) => item.key)).toEqual(['A|Ulica A', 'B|Ulica B', 'C|Ulica C']);
    const dates = defaultStopDates(stops, cargos);
    expect(dates['A|Ulica A']).toBe('2026-11-11');
    expect(cargoStopDatesFor(cargos, dates)).toEqual([
      { cargoId: 'c1', loadingDate: '2026-11-11', unloadingDate: '2026-11-14' },
      { cargoId: 'c2', loadingDate: '2026-11-11', unloadingDate: '2026-11-13' },
    ]);
    expect(getAssignStopDates(cargos).missingDates).toBe(false);
  });
});
