import { describe, expect, it } from 'vitest';

import type { Cargo, VehicleStop } from '@/lib/api';
import { LoadStatus } from '@/lib/api/shipments';

import {
  agencyEndpointState,
  agencyRouteState,
  agencyStopChanges,
  agencyUndoBlocked,
  buildAgencyRouteStops,
  buildRouteStops,
  buildVehicleRouteStops,
  type Place,
  routeState,
  toTrackCargo,
  type TrackCargo,
} from './routeData';

const place = (postalCode: string, placeName: string, countryCode = 'AT'): Place => ({
  countryCode,
  postalCode,
  placeName,
});

const HORSCHING = place('4063', 'Hörsching');
const BAD_HALL = place('4540', 'Bad Hall');
const SAINT_HERBLAIN = place('44800', 'Saint-Herblain', 'FR');
const MORLAIX = place('29600', 'Morlaix', 'FR');
const LONGVIC = place('21600', 'Longvic', 'FR');

const cargo = (
  id: string,
  from: Place | null,
  readyDate: string | null,
  to: Place | null,
  dueDate: string | null,
  status = LoadStatus.NotYetLoaded
): TrackCargo => ({ id, from, readyDate, to, dueDate, status });

/** „Today” for the progress rules: after every date of the grouping tests, so their ✓ / order don't depend on it. */
const NOW = new Date(2026, 10, 10, 12);

const summary = (cargos: TrackCargo[]) =>
  buildRouteStops(cargos, NOW).map(
    (stop) =>
      `${stop.day ?? '—'} ${stop.kind} ${stop.place?.placeName ?? '—'} [${stop.cargos.map((item) => item.id)}]${stop.done ? ' ✓' : ''}`
  );

describe('buildRouteStops', () => {
  it('orders the stops by day and groups a place shared on the same day (the lab’s nalog)', () => {
    expect(
      summary([
        cargo('t1', BAD_HALL, '2026-11-08', SAINT_HERBLAIN, '2026-11-09', LoadStatus.Unloaded),
        cargo('t2', HORSCHING, '2026-11-06', MORLAIX, '2026-11-09', LoadStatus.Unloaded),
        cargo('t3', HORSCHING, '2026-11-06', LONGVIC, '2026-11-09', LoadStatus.Loaded),
      ])
    ).toEqual([
      '2026-11-06 loading Hörsching [t2,t3] ✓',
      '2026-11-08 loading Bad Hall [t1] ✓',
      '2026-11-09 unloading Saint-Herblain [t1] ✓',
      '2026-11-09 unloading Morlaix [t2] ✓',
      '2026-11-09 unloading Longvic [t3]',
    ]);
  });

  it('keeps the same place on different days apart, utovari before istovari on one day, undated last', () => {
    expect(
      summary([
        cargo('t1', HORSCHING, '2026-11-06', LONGVIC, '2026-11-08'),
        cargo('t2', HORSCHING, '2026-11-07', LONGVIC, null),
        cargo('t3', BAD_HALL, '2026-11-08', MORLAIX, '2026-11-09'),
      ])
    ).toEqual([
      '2026-11-06 loading Hörsching [t1]',
      '2026-11-07 loading Hörsching [t2]',
      '2026-11-08 loading Bad Hall [t3]',
      '2026-11-08 unloading Longvic [t1]',
      '2026-11-09 unloading Morlaix [t3]',
      '— unloading Longvic [t2]',
    ]);
  });

  it('treats a datetime as its calendar day', () => {
    expect(
      summary([
        cargo('t1', HORSCHING, '2026-11-06T08:00:00', LONGVIC, '2026-11-08'),
        cargo('t2', HORSCHING, '2026-11-06T14:30:00', MORLAIX, '2026-11-08'),
      ])
    ).toEqual([
      '2026-11-06 loading Hörsching [t1,t2]',
      '2026-11-08 unloading Longvic [t1]',
      '2026-11-08 unloading Morlaix [t2]',
    ]);
  });

  it('marks a shared stop done only when every cargo there is done', () => {
    const stops = buildRouteStops([
      cargo('t1', HORSCHING, '2026-11-06', LONGVIC, '2026-11-08', LoadStatus.Loaded),
      cargo('t2', HORSCHING, '2026-11-06', LONGVIC, '2026-11-08', LoadStatus.NotYetLoaded),
      cargo('t3', BAD_HALL, '2026-11-07', MORLAIX, '2026-11-09', LoadStatus.Unloaded),
    ]);
    expect(stops.map((stop) => [stop.place?.placeName, stop.cargos.length, stop.done])).toEqual([
      ['Hörsching', 2, false],
      ['Bad Hall', 1, true],
      ['Longvic', 2, false],
      ['Morlaix', 1, true],
    ]);
  });

  describe('progress (the table route track’s rules)', () => {
    const states = (cargos: TrackCargo[], now = NOW) =>
      buildRouteStops(cargos, now).map(
        (stop) => `${stop.place?.placeName} ${stop.state}${stop.daysLate ? ` ${stop.daysLate}` : ''}`
      );

    it('not started: the next stop is waiting while nothing is loaded and no ready date has passed', () => {
      expect(
        states([
          cargo('t1', HORSCHING, '2026-11-10', LONGVIC, '2026-11-12'),
          cargo('t2', BAD_HALL, '2026-11-11', MORLAIX, '2026-11-13'),
        ])
      ).toEqual(['Hörsching waiting', 'Bad Hall planned', 'Longvic planned', 'Morlaix planned']);
    });

    it('late: the next utovar still not loaded after its ready date, with the days late', () => {
      expect(
        states([
          cargo('t1', HORSCHING, '2026-11-08', LONGVIC, '2026-11-12'),
          cargo('t2', BAD_HALL, '2026-11-09', MORLAIX, '2026-11-13'),
        ])
      ).toEqual(['Hörsching late 2', 'Bad Hall planned', 'Longvic planned', 'Morlaix planned']);
    });

    it('on the way: once a cargo is loaded the vehicle is on its way to the next stop', () => {
      expect(
        states([
          cargo('t1', HORSCHING, '2026-11-06', LONGVIC, '2026-11-12', LoadStatus.Loaded),
          cargo('t2', BAD_HALL, '2026-11-11', MORLAIX, '2026-11-13'),
        ])
      ).toEqual(['Hörsching done', 'Bad Hall transit', 'Longvic planned', 'Morlaix planned']);
    });

    it('late wins over on the way; a loaded istovar past its due date is late too', () => {
      expect(
        states([
          cargo('t1', HORSCHING, '2026-11-06', LONGVIC, '2026-11-12', LoadStatus.Loaded),
          cargo('t2', BAD_HALL, '2026-11-09', MORLAIX, '2026-11-13'),
        ])
      ).toEqual(['Hörsching done', 'Bad Hall late 1', 'Longvic planned', 'Morlaix planned']);
      expect(states([cargo('t1', HORSCHING, '2026-11-06', LONGVIC, '2026-11-08', LoadStatus.Loaded)])).toEqual([
        'Hörsching done',
        'Longvic late 2',
      ]);
    });

    it('done: every stop done once everything is unloaded', () => {
      expect(
        states([
          cargo('t1', HORSCHING, '2026-11-06', LONGVIC, '2026-11-08', LoadStatus.Unloaded),
          cargo('t2', HORSCHING, '2026-11-06', MORLAIX, '2026-11-09', LoadStatus.Unloaded),
        ])
      ).toEqual(['Hörsching done', 'Longvic done', 'Morlaix done']);
    });
  });
});

describe('routeState (a table row)', () => {
  const row = (statuses: LoadStatus[], readyDate = '2026-11-12') =>
    routeState(
      statuses.map((status, index) => cargo(`t${index}`, HORSCHING, readyDate, LONGVIC, '2026-11-14', status)),
      NOW
    );

  it('done when all unloaded, transit when all loaded, partial when some, else late past the ready date or waiting', () => {
    expect(row([LoadStatus.Unloaded, LoadStatus.Unloaded])).toBe('done');
    expect(row([LoadStatus.Loaded, LoadStatus.Unloaded])).toBe('transit');
    expect(row([LoadStatus.Loaded, LoadStatus.NotYetLoaded])).toBe('partial');
    expect(row([LoadStatus.NotYetLoaded], '2026-11-09')).toBe('late');
    expect(row([LoadStatus.NotYetLoaded], '2026-11-10')).toBe('waiting');
  });

  it('lateUnloading when a loaded cargo is past its due date', () => {
    const late = [cargo('t1', HORSCHING, '2026-11-05', LONGVIC, '2026-11-08', LoadStatus.Loaded)];
    expect(routeState(late, NOW)).toBe('lateUnloading');
    const unloaded = [cargo('t1', HORSCHING, '2026-11-05', LONGVIC, '2026-11-08', LoadStatus.Unloaded)];
    expect(routeState(unloaded, NOW)).toBe('done');
  });
});

describe('toTrackCargo', () => {
  const base = { id: 'c1', loadingReadyDate: null, unloadingDueDate: null } as unknown as Cargo;
  const stops = [
    { date: '2026-11-30', loadingCargos: [{ id: 'c1' }], unloadingCargos: [] },
    { date: '2026-12-06', loadingCargos: [], unloadingCargos: [{ id: 'c1' }] },
  ] as unknown as VehicleStop[];

  it('falls back to the dates planned on the vehicle stops (Dodijeli vozilo) when the cargo has none', () => {
    expect(toTrackCargo(base, stops)).toMatchObject({ readyDate: '2026-11-30', dueDate: '2026-12-06' });
  });

  it('keeps the cargo’s own dates when it has them', () => {
    const dated = { ...base, loadingReadyDate: '2026-11-28', unloadingDueDate: '2026-12-04' } as Cargo;
    expect(toTrackCargo(dated, stops)).toMatchObject({ readyDate: '2026-11-28', dueDate: '2026-12-04' });
  });
});

describe('agency nalozi (hand-marked by the dispatcher, never tracking)', () => {
  const states = (cargos: TrackCargo[]) =>
    buildAgencyRouteStops(cargos, NOW).map((stop) => `${stop.place?.placeName} ${stop.state}`);

  it('marked once every teret there is marked, overdue when the date passed unmarked, else planned', () => {
    expect(
      states([
        cargo('t1', HORSCHING, '2026-11-08', LONGVIC, '2026-11-11', LoadStatus.Loaded),
        cargo('t2', BAD_HALL, '2026-11-09', MORLAIX, '2026-11-12'),
      ])
    ).toEqual(['Hörsching marked', 'Bad Hall overdue', 'Longvic planned', 'Morlaix planned']);
  });

  it('never late or on the way: a loaded teret past its due date is just overdue, the next stop just planned', () => {
    const stops = buildAgencyRouteStops(
      [
        cargo('t1', HORSCHING, '2026-11-06', LONGVIC, '2026-11-08', LoadStatus.Loaded),
        cargo('t2', BAD_HALL, '2026-11-11', MORLAIX, '2026-11-13'),
      ],
      NOW
    );
    expect(stops.map((stop) => `${stop.place?.placeName} ${stop.state}`)).toEqual([
      'Hörsching marked',
      'Longvic overdue',
      'Bad Hall planned',
      'Morlaix planned',
    ]);
    expect(stops.every((stop) => !('daysLate' in stop))).toBe(true);
  });

  it('a shared stop with one teret unmarked is not marked; undated stops stay planned', () => {
    expect(
      states([
        cargo('t1', HORSCHING, '2026-11-12', LONGVIC, null, LoadStatus.Loaded),
        cargo('t2', HORSCHING, '2026-11-12', LONGVIC, null),
      ])
    ).toEqual(['Hörsching planned', 'Longvic planned']);
  });

  it('istovareno also marks the utovar; a stop with every teret istovaren is marked on both sides', () => {
    expect(states([cargo('t1', HORSCHING, '2026-11-08', LONGVIC, '2026-11-09', LoadStatus.Unloaded)])).toEqual([
      'Hörsching marked',
      'Longvic marked',
    ]);
  });

  describe('agencyStopChanges (Označi … / Vrati na …)', () => {
    const loading = {
      kind: 'loading' as const,
      cargos: [
        cargo('t1', HORSCHING, null, LONGVIC, null),
        cargo('t2', HORSCHING, null, MORLAIX, null, LoadStatus.Loaded),
      ],
    };
    const unloading = {
      kind: 'unloading' as const,
      cargos: [
        cargo('t1', HORSCHING, null, LONGVIC, null),
        cargo('t2', BAD_HALL, null, LONGVIC, null, LoadStatus.Loaded),
        cargo('t3', BAD_HALL, null, LONGVIC, null, LoadStatus.Unloaded),
      ],
    };

    it('Označi utovareno: only the tereti not yet loaded → Utovaren', () => {
      expect(agencyStopChanges(loading)).toEqual([{ cargoId: 't1', status: LoadStatus.Loaded }]);
    });

    it('Označi istovareno: every teret not yet unloaded (also never loaded ones) → Istovaren', () => {
      expect(agencyStopChanges(unloading)).toEqual([
        { cargoId: 't1', status: LoadStatus.Unloaded },
        { cargoId: 't2', status: LoadStatus.Unloaded },
      ]);
    });

    it('Vrati na …: one step back; a utovar with a teret already istovaren is blocked', () => {
      expect(agencyStopChanges(loading, true)).toEqual([{ cargoId: 't2', status: LoadStatus.NotYetLoaded }]);
      expect(agencyStopChanges(unloading, true)).toEqual([{ cargoId: 't3', status: LoadStatus.Loaded }]);
      expect(agencyUndoBlocked(loading)).toBe(false);
      expect(agencyUndoBlocked({ kind: 'loading', cargos: unloading.cargos })).toBe(true);
      expect(agencyUndoBlocked(unloading)).toBe(false);
    });
  });

  describe('agencyRouteState (a table row)', () => {
    const row = (statuses: LoadStatus[], readyDate = '2026-11-12', dueDate = '2026-11-14') =>
      agencyRouteState(
        statuses.map((status, index) => cargo(`t${index}`, HORSCHING, readyDate, LONGVIC, dueDate, status)),
        NOW
      );

    it('done when all istovareno, loaded when all utovareno, else planned — never transit, partial or late', () => {
      expect(row([LoadStatus.Unloaded, LoadStatus.Unloaded])).toBe('done');
      expect(row([LoadStatus.Loaded, LoadStatus.Unloaded])).toBe('loaded');
      expect(row([LoadStatus.Loaded, LoadStatus.NotYetLoaded])).toBe('planned');
      expect(row([LoadStatus.NotYetLoaded], '2026-11-10')).toBe('planned');
    });

    it('overdue (amber) instead of „Kasni utovar / istovar”', () => {
      expect(row([LoadStatus.NotYetLoaded], '2026-11-09')).toBe('overdueLoading');
      expect(row([LoadStatus.Loaded], '2026-11-05', '2026-11-08')).toBe('overdueUnloading');
      expect(row([LoadStatus.Unloaded], '2026-11-05', '2026-11-08')).toBe('done');
    });
  });

  describe('agencyEndpointState (a place on the table track)', () => {
    const point = [
      cargo('t1', HORSCHING, '2026-11-09', LONGVIC, '2026-11-12', LoadStatus.Loaded),
      cargo('t2', HORSCHING, '2026-11-09', MORLAIX, '2026-11-12'),
    ];

    it('counts the marked tereti for the side; overdue only for the unmarked ones past their date', () => {
      expect(agencyEndpointState(point, 'loading', NOW)).toEqual({ state: 'overdue', marked: 1 });
      expect(agencyEndpointState(point, 'unloading', NOW)).toEqual({ state: 'planned', marked: 0 });
      expect(agencyEndpointState([point[0]], 'loading', NOW)).toEqual({ state: 'marked', marked: 1 });
    });
  });
});

describe('buildVehicleRouteStops (Nalog detail, own nalog with a vehicle)', () => {
  const vStop = (
    id: string,
    date: string | null,
    loading: string[],
    unloading: string[],
    completedAt?: string
  ): VehicleStop =>
    ({
      id,
      createdAt: `2026-11-01T00:00:0${id.length}`,
      date,
      completedAt,
      loadingCargos: loading.map((cargoId) => ({ id: cargoId })),
      unloadingCargos: unloading.map((cargoId) => ({ id: cargoId })),
    }) as unknown as VehicleStop;

  const states = (stops: VehicleStop[], cargoIds = ['t1', 't2']) =>
    buildVehicleRouteStops(stops, cargoIds, NOW).map(
      (row) => `${row.key} ${row.kinds.join('+')} ${row.state}${row.daysLate ? ` ${row.daysLate}` : ''}`
    );

  it('done = the stop completed (not the cargo status); the next one waits until a stop is done', () => {
    expect(states([vStop('b', '2026-11-12', [], ['t1']), vStop('a', '2026-11-11', ['t1'], [])])).toEqual([
      'a loading waiting',
      'b unloading planned',
    ]);
  });

  it('on its way once an earlier stop is done; late (with days) once the next stop’s date passed', () => {
    expect(
      states([vStop('a', '2026-11-06', ['t1'], [], '2026-11-06T09:00:00'), vStop('b', '2026-11-12', [], ['t1'])])
    ).toEqual(['a loading done', 'b unloading transit']);
    expect(
      states([vStop('a', '2026-11-06', ['t1'], [], '2026-11-06T09:00:00'), vStop('b', '2026-11-08', [], ['t1'])])
    ).toEqual(['a loading done', 'b unloading late 2']);
  });

  it('keeps only this nalog’s tereti, drops stops without them, one row for a utovar + istovar visit', () => {
    const rows = buildVehicleRouteStops(
      [vStop('a', '2026-11-11', ['x', 't2', 't1'], ['t3']), vStop('b', '2026-11-12', ['x'], [])],
      ['t1', 't2', 't3'],
      NOW
    );
    expect(rows.map((row) => [row.key, row.kinds, row.loadingIds, row.unloadingIds])).toEqual([
      ['a', ['loading', 'unloading'], ['t1', 't2'], ['t3']],
    ]);
  });

  it('blocks an istovar before its utovar and undoing a utovar whose istovar is done', () => {
    const open = buildVehicleRouteStops(
      [vStop('a', '2026-11-11', ['t1'], []), vStop('b', '2026-11-12', [], ['t1'])],
      ['t1'],
      NOW
    );
    expect(open.map((row) => row.blocked)).toEqual([undefined, 'Prvo potvrdi utovar ovog tereta.']);
    const done = buildVehicleRouteStops(
      [vStop('a', '2026-11-06', ['t1'], [], '2026-11-06'), vStop('b', '2026-11-08', [], ['t1'], '2026-11-08')],
      ['t1'],
      NOW
    );
    expect(done.map((row) => row.blocked)).toEqual(['Teret je već istovaren. Prvo poništi taj istovar.', undefined]);
  });
});
