import { describe, expect, it } from 'vitest';

import type { Cargo } from '@/lib/api';

import { buildAssignStops, cargoStopDatesFor, defaultStopDates, getAssignStopDates } from './assignStops';

// The basic merge (shared addresses, earliest date, loading first) is in AssignVehiclePage/route.test.ts.

const address = (id: string, streetName = `Ulica ${id}`) => ({
  postalCodeId: id,
  streetName,
  postalCode: id,
  placeName: id,
  countryCode: 'HR',
});

const cargo = (id: string, overrides: Partial<Cargo> = {}) =>
  ({
    id,
    loadingAddress: address('A'),
    unloadingAddress: address('B'),
    loadingReadyDate: '2026-11-11',
    unloadingDueDate: '2026-11-13',
    ...overrides,
  }) as Cargo;

describe('buildAssignStops', () => {
  it('a stop is the postal code and the street', () => {
    const stops = buildAssignStops([
      cargo('c1', { loadingAddress: address('A', 'Ulica 1') }),
      cargo('c2', { loadingAddress: address('A', 'Ulica 2') }),
    ]);
    expect(stops.map((stop) => stop.key)).toEqual(['A|Ulica 1', 'A|Ulica 2', 'B|Ulica B']);
    expect(stops[2].unloadingCargoIds).toEqual(['c1', 'c2']);
  });

  it('one address can be an istovar and an utovar; it counts as a loading stop', () => {
    const stops = buildAssignStops([
      cargo('c1', { loadingAddress: address('A'), unloadingAddress: address('B') }),
      cargo('c2', { loadingAddress: address('B'), unloadingAddress: address('C') }),
    ]);
    expect(stops.map((stop) => [stop.key, stop.loadingCargoIds, stop.unloadingCargoIds])).toEqual([
      ['A|Ulica A', ['c1'], []],
      ['B|Ulica B', ['c2'], ['c1']],
      ['C|Ulica C', [], ['c2']],
    ]);
  });

  it('puts loading stops first, keeping the order within each group', () => {
    const stops = buildAssignStops([
      cargo('c1', { loadingAddress: undefined as never, unloadingAddress: address('X') }),
      cargo('c2', { loadingAddress: address('A'), unloadingAddress: address('Y') }),
      cargo('c3', { loadingAddress: address('B'), unloadingAddress: address('X') }),
    ]);
    expect(stops.map((stop) => stop.key)).toEqual(['A|Ulica A', 'B|Ulica B', 'X|Ulica X', 'Y|Ulica Y']);
  });

  it('takes the first company name given for the address', () => {
    const [load, unload] = buildAssignStops([
      cargo('c1', { loadingCompanyName: '', unloadingCompanyName: 'Podravka DE' }),
      cargo('c2', { loadingCompanyName: 'Podravka', unloadingCompanyName: 'Drugi' }),
    ]);
    expect(load.companyName).toBe('Podravka');
    expect(unload.companyName).toBe('Podravka DE');
  });

  it('no company name stays undefined', () => {
    expect(buildAssignStops([cargo('c1', { loadingCompanyName: '' })])[0].companyName).toBeUndefined();
  });

  it('skips missing addresses', () => {
    expect(
      buildAssignStops([cargo('c1', { loadingAddress: undefined, unloadingAddress: undefined } as never)])
    ).toEqual([]);
    expect(buildAssignStops([])).toEqual([]);
  });
});

describe('defaultStopDates', () => {
  it('is null without any date', () => {
    const cargos = [cargo('c1', { loadingReadyDate: undefined, unloadingDueDate: '' })];
    expect(defaultStopDates(buildAssignStops(cargos), cargos)).toEqual({ 'A|Ulica A': null, 'B|Ulica B': null });
  });

  it('uses the istovar date of a shared address when it is earlier', () => {
    const cargos = [
      cargo('c1', { unloadingAddress: address('B'), unloadingDueDate: '2026-11-12' }),
      cargo('c2', { loadingAddress: address('B'), loadingReadyDate: '2026-11-14', unloadingAddress: address('C') }),
    ];
    expect(defaultStopDates(buildAssignStops(cargos), cargos)['B|Ulica B']).toBe('2026-11-12');
  });

  it('cuts a date-time down to the day', () => {
    const cargos = [cargo('c1', { loadingReadyDate: '2026-11-11T08:30:00' })];
    expect(defaultStopDates(buildAssignStops(cargos), cargos)['A|Ulica A']).toBe('2026-11-11');
  });

  it('ignores ids of other cargos', () => {
    const stops = buildAssignStops([cargo('c1')]);
    expect(defaultStopDates(stops, [])).toEqual({ 'A|Ulica A': null, 'B|Ulica B': null });
  });
});

describe('cargoStopDatesFor', () => {
  it('null for a missing address or a stop without a date', () => {
    const cargos = [cargo('c1', { unloadingAddress: undefined as never })];
    expect(cargoStopDatesFor(cargos, {})).toEqual([{ cargoId: 'c1', loadingDate: null, unloadingDate: null }]);
    expect(cargoStopDatesFor(cargos, { 'A|Ulica A': '2026-11-11' })).toEqual([
      { cargoId: 'c1', loadingDate: '2026-11-11', unloadingDate: null },
    ]);
  });
});

describe('getAssignStopDates', () => {
  it('missing dates when a stop has none', () => {
    const { cargoStopDates, missingDates } = getAssignStopDates([cargo('c1', { unloadingDueDate: undefined })]);
    expect(missingDates).toBe(true);
    expect(cargoStopDates).toEqual([{ cargoId: 'c1', loadingDate: '2026-11-11', unloadingDate: null }]);
  });

  it('missing dates when there are no stops', () => {
    expect(getAssignStopDates([])).toEqual({ cargoStopDates: [], missingDates: true });
  });
});
