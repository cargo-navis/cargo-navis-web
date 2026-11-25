import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';

import type { VehicleStop, VehicleStopAddress, VehicleStopCargo } from '@/lib/api/vehicleStops';

import {
  chronological,
  companyOf,
  dayOf,
  firstName,
  isDone,
  kindsOf,
  kindWord,
  placeOnly,
  placeWithPostalCode,
  shipmentsOf,
  stopToastTitle,
  toApiDate,
  toUpdatePayload,
} from './stops';

const address = (overrides: Partial<VehicleStopAddress> = {}): VehicleStopAddress => ({
  streetName: 'Ulica 1',
  postalCodeId: 'pc1',
  postalCode: '48000',
  countryCode: 'HR',
  placeName: 'Koprivnica',
  ...overrides,
});

const cargo = (id: string, overrides: Partial<VehicleStopCargo> = {}): VehicleStopCargo =>
  ({
    id,
    shipment: { id: 's1', orderNumber: '2041/2026', clientId: null },
    description: null,
    metadata: { type: 'standard', palleteType: 'euro', palleteAmount: 24, width: 0, height: 0, length: 0 },
    loadingCompanyName: null,
    unloadingCompanyName: null,
    ...overrides,
  }) as VehicleStopCargo;

const stop = (overrides: Partial<VehicleStop> = {}): VehicleStop => ({
  id: 'st1',
  createdAt: '',
  vehicleId: 'v1',
  previousStopId: null,
  address: null,
  date: null,
  driverId: null,
  trailerId: null,
  disponentId: null,
  loadingCargos: [],
  unloadingCargos: [],
  documents: [],
  messageSentAt: null,
  ...overrides,
});

const loading = stop({ loadingCargos: [cargo('c1')] });
const unloading = stop({ unloadingCargos: [cargo('c2')] });
const both = stop({ loadingCargos: [cargo('c1')], unloadingCargos: [cargo('c2')] });
const empty = stop();

describe('kinds', () => {
  it('reads the kind from the cargo', () => {
    expect(kindsOf(loading)).toEqual(['loading']);
    expect(kindsOf(unloading)).toEqual(['unloading']);
    expect(kindsOf(both)).toEqual(['loading', 'unloading']);
    expect(kindsOf(empty)).toEqual([]);
  });

  it.each([
    [loading, 'utovar', 'utovara'],
    [unloading, 'istovar', 'istovara'],
    [both, 'utovar i istovar', 'utovara i istovara'],
    [empty, 'utovar / istovar', 'utovara / istovara'],
  ])('kindWord → %#', (value, nominative, genitive) => {
    expect(kindWord(value)).toBe(nominative);
    expect(kindWord(value, 'genitive')).toBe(genitive);
  });

  it.each([
    [loading, 'ažuriran', 'Utovar ažuriran'],
    [unloading, 'obrisan', 'Istovar obrisan'],
    [both, 'ažuriran', 'Utovar i istovar ažurirani'],
    [both, 'obrisan', 'Utovar i istovar obrisani'],
    [empty, 'obrisan', 'Utovar / istovar obrisan'],
  ] as const)('toast title %# → %s', (value, done, title) => expect(stopToastTitle(value, done)).toBe(title));
});

describe('places', () => {
  it('shows the place, else the postal code', () => {
    expect(placeOnly(stop({ address: address() }))).toBe('Koprivnica');
    expect(placeOnly(stop({ address: address({ placeName: null }) }))).toBe('48000');
    expect(placeOnly(stop({ address: address({ placeName: null, postalCode: '' }) }))).toBe('Bez adrese');
    expect(placeOnly(empty)).toBe('Bez adrese');
  });

  it('joins postal code and place', () => {
    expect(placeWithPostalCode(stop({ address: address() }))).toBe('48000 Koprivnica');
    expect(placeWithPostalCode(stop({ address: address({ placeName: null }) }))).toBe('48000');
    expect(placeWithPostalCode(empty)).toBe('Bez adrese');
  });
});

describe('companyOf', () => {
  it('lists loading and unloading companies once', () => {
    const value = stop({
      loadingCargos: [
        cargo('c1', { loadingCompanyName: 'Podravka d.d.', unloadingCompanyName: 'Ignored' }),
        cargo('c2', { loadingCompanyName: 'Podravka d.d.' }),
      ],
      unloadingCargos: [cargo('c3', { unloadingCompanyName: 'Konzum' }), cargo('c4')],
    });
    expect(companyOf(value)).toBe('Podravka d.d., Konzum');
    expect(companyOf(empty)).toBe('');
  });
});

describe('shipmentsOf', () => {
  it('groups cargo per nalog with its kinds and unique labels', () => {
    const other = { id: 's2', orderNumber: '2042/2026', clientId: null };
    const value = stop({
      loadingCargos: [
        cargo('c1'),
        cargo('c2'),
        cargo('c3', {
          shipment: other,
          metadata: { type: 'nonstandard', palleteType: '', palleteAmount: 0, width: 2, height: 1, length: 3 },
        }),
      ],
      unloadingCargos: [cargo('c4', { metadata: { ...cargo('x').metadata, palleteAmount: 2 } })],
    });
    expect(shipmentsOf(value)).toEqual([
      {
        shipment: { id: 's1', orderNumber: '2041/2026', clientId: null },
        kinds: ['loading', 'unloading'],
        cargo: '24 x Euro Paleta (120x80), 2 x Euro Paleta (120x80)',
      },
      { shipment: other, kinds: ['loading'], cargo: '3m x 2m x 1m' },
    ]);
    expect(shipmentsOf(empty)).toEqual([]);
  });
});

describe('dates', () => {
  it('reads the stop day as local midnight', () => {
    expect(dayOf(stop({ date: '2026-11-07' }))?.toDate()).toEqual(new Date(2026, 10, 7));
    expect(dayOf(empty)).toBeNull();
  });

  it('formats for the API', () => {
    expect(toApiDate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    expect(toApiDate(dayjs('2026-12-31').toDate())).toBe('2026-12-31');
  });
});

describe('toUpdatePayload', () => {
  const full = stop({
    address: address({ streetName: null }),
    date: '2026-11-07',
    driverId: 'd1',
    trailerId: 't1',
    disponentId: 'p1',
    loadingCargos: [cargo('c1')],
    unloadingCargos: [cargo('c2'), cargo('c3')],
  });

  it('resends the whole stop', () => {
    expect(toUpdatePayload(full)).toEqual({
      address: { streetName: null, postalCodeId: 'pc1' },
      date: '2026-11-07',
      driverId: 'd1',
      trailerId: 't1',
      disponentId: 'p1',
      loadingCargoIds: ['c1'],
      unloadingCargoIds: ['c2', 'c3'],
    });
  });

  it('applies the patch on top', () => {
    expect(toUpdatePayload(full, { driverId: null, date: '2026-11-08' })).toMatchObject({
      driverId: null,
      date: '2026-11-08',
      trailerId: 't1',
    });
  });

  it('sends a missing address as null', () => {
    expect(toUpdatePayload(empty).address).toBeNull();
  });
});

describe('misc', () => {
  it('reverses into oldest first without changing the input', () => {
    const stops = [stop({ id: 'b' }), stop({ id: 'a' })];
    expect(chronological(stops).map((value) => value.id)).toEqual(['a', 'b']);
    expect(stops.map((value) => value.id)).toEqual(['b', 'a']);
  });

  it('knows a finished stop', () => {
    expect(isDone(stop({ completedAt: '2026-11-07T10:00:00Z' }))).toBe(true);
    expect(isDone(empty)).toBe(false);
  });

  it.each([
    ['Ivan Horvat', 'Ivan'],
    ['  Ana   Marija Kovač ', 'Ana'],
    ['Ivan', 'Ivan'],
  ])('first name of „%s” → %s', (name, first) => expect(firstName(name)).toBe(first));
});
