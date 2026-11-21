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

  it('shows the last 3 done, the planned and the new stops with a Danas line', () => {
    const items = timelineOf(STOPS, NEW, TODAY);
    expect(
      items.map((item) =>
        item.type === 'stop' ? item.stop.id : item.type === 'new' ? `new-${item.stop.key}` : 'today'
      )
    ).toEqual(['s1', 's2', 's3', 'today', 's4', 'new-a', 's5', 'new-b']);
    expect(items.find((item) => item.type === 'stop' && item.stop.id === 's4')).toMatchObject({ clash: true });
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
