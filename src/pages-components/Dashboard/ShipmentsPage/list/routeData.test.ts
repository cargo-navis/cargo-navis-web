import { describe, expect, it } from 'vitest';

import type { Cargo, VehicleStop } from '@/lib/api';
import { LoadStatus } from '@/lib/api/shipments';

import { buildRouteStops, type Place, routeState, toTrackCargo, type TrackCargo } from './routeData';

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
