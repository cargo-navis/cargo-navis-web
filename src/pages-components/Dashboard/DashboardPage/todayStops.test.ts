import { describe, expect, it } from 'vitest';

import { LoadStatus } from '@/lib/api/shipments';
import type { Cargo, Shipment } from '@/lib/api/shipments.d';
import type { VehicleStop } from '@/lib/api/vehicleStops.d';

import { buildTodayStops, summarizeCargo } from './todayStops';

const TODAY = new Date(2026, 5, 16, 9); // utorak 16.6.2026.

const address = (postalCode: string, placeName: string, countryCode = 'HR') => ({
  streetName: 'Ulica 1',
  postalCodeId: postalCode,
  postalCode,
  placeName,
  countryCode,
});

const metadata = (patch: Partial<Cargo['metadata']> = {}): Cargo['metadata'] => ({
  type: 'standard',
  palleteType: 'EUR',
  palleteAmount: 10,
  width: 0,
  height: 0,
  length: 0,
  ...patch,
});

const cargo = (id: string, patch: Partial<Cargo> = {}): Cargo => ({
  id,
  weight: 5000,
  ldm: 4,
  description: '',
  metadata: metadata(),
  loadingAddress: address('10000', 'Zagreb'),
  unloadingAddress: address('1000', 'Ljubljana', 'SI'),
  ...patch,
});

const shipment = (id: string, patch: Partial<Shipment> = {}): Shipment =>
  ({
    id,
    orderNumber: `${id}/2026`,
    clientId: 'c1',
    isAgency: false,
    cargo: [],
    ...patch,
  }) as Shipment;

const stop = (patch: Partial<VehicleStop>): VehicleStop =>
  ({
    id: 's',
    vehicleId: 'v1',
    driverId: 'd1',
    loadingCargos: [],
    unloadingCargos: [],
    ...patch,
  }) as VehicleStop;

const loading = (id: string, patch: Partial<Cargo> = {}) => cargo(id, { loadingReadyDate: '2026-06-16', ...patch });
const unloading = (id: string, patch: Partial<Cargo> = {}) => cargo(id, { unloadingDueDate: '2026-06-16', ...patch });
const ids = (...values: string[]) => values.map((id) => ({ id })) as VehicleStop['loadingCargos'];

describe('summarizeCargo', () => {
  it.each([
    ['nothing', [], '—'],
    ['pallets and tonnes', [cargo('a'), cargo('b', { weight: 8400 })], '20 pal · 13,4 t'],
    [
      'LDM when not standard',
      [cargo('a', { metadata: metadata({ type: 'nonstandard' }), ldm: 13.6 })],
      '13,6 LDM · 5 t',
    ],
    ['LDM when no pallet count', [cargo('a', { metadata: metadata({ palleteAmount: undefined }) })], '4 LDM · 5 t'],
    ['only tonnes', [cargo('a', { metadata: metadata({ type: 'nonstandard' }), ldm: 0, weight: 500 })], '0,5 t'],
    ['only pallets', [cargo('a', { weight: 0 })], '10 pal'],
    ['nothing measured', [cargo('a', { metadata: metadata({ type: 'nonstandard' }), ldm: 0, weight: 0 })], '—'],
  ])('%s', (_, cargos, text) => expect(summarizeCargo(cargos)).toBe(text));

  it('counts only the pallets of standard cargo', () => {
    const mixed = [cargo('a'), cargo('b', { metadata: metadata({ type: 'nonstandard', palleteAmount: 33 }) })];
    expect(summarizeCargo(mixed)).toBe('10 pal · 10 t');
  });

  it('copes with missing values', () => {
    expect(summarizeCargo([{ weight: undefined, ldm: undefined, metadata: undefined } as never])).toBe('—');
  });
});

describe('buildTodayStops', () => {
  it('is empty without shipments', () => {
    expect(buildTodayStops([], TODAY)).toEqual([]);
  });

  it('skips cargo of other days and without a date', () => {
    const rows = buildTodayStops(
      [
        shipment('1', {
          cargo: [
            cargo('a', { loadingReadyDate: '2026-06-15', unloadingDueDate: '2026-06-17' }),
            cargo('b'),
            cargo('c', { loadingReadyDate: '2025-06-16' }),
          ],
        }),
      ],
      TODAY
    );
    expect(rows).toEqual([]);
  });

  it('copes with a shipment without cargo or vehicle stops', () => {
    expect(buildTodayStops([shipment('1', { cargo: undefined, vehicleStops: undefined })], TODAY)).toEqual([]);
  });

  it('matches today by calendar day, whatever the time', () => {
    const late = new Date(2026, 5, 16, 23, 59);
    const rows = buildTodayStops(
      [shipment('1', { cargo: [loading('a', { loadingReadyDate: '2026-06-16T06:00:00' })] })],
      late
    );
    expect(rows).toHaveLength(1);
  });

  it('sums the tereti at one place into one row and splits different places', () => {
    const rows = buildTodayStops(
      [
        shipment('1', {
          cargo: [
            loading('a'),
            loading('b'),
            loading('c', { loadingAddress: address('21000', 'Split') }),
            loading('d', { loadingAddress: address('10000', 'Zagreb', 'SI') }),
          ],
        }),
      ],
      TODAY
    );
    expect(rows.map((row) => [row.id, row.place, row.countryCode, row.cargo])).toEqual([
      ['1:utovar:HR|10000|Zagreb', '10000 Zagreb', 'HR', '20 pal · 10 t'],
      ['1:utovar:HR|21000|Split', '21000 Split', 'HR', '10 pal · 5 t'],
      ['1:utovar:SI|10000|Zagreb', '10000 Zagreb', 'SI', '10 pal · 5 t'],
    ]);
  });

  it('lists all utovari before the istovari', () => {
    const rows = buildTodayStops(
      [shipment('1', { cargo: [unloading('a')] }), shipment('2', { cargo: [loading('b')] })],
      TODAY
    );
    expect(rows.map((row) => [row.orderNumber, row.kind])).toEqual([
      ['2/2026', 'utovar'],
      ['1/2026', 'istovar'],
    ]);
  });

  it('shows a dash when the place is unknown', () => {
    const rows = buildTodayStops(
      [shipment('1', { cargo: [loading('a', { loadingAddress: undefined as never })] })],
      TODAY
    );
    expect(rows[0]).toMatchObject({ id: '1:utovar:||', place: '—', countryCode: undefined });
  });

  it('copies the nalog fields', () => {
    const [row] = buildTodayStops(
      [shipment('7', { clientId: 'c9', isAgency: true, transportContractorId: 'k1', cargo: [unloading('a')] })],
      TODAY
    );
    expect(row).toMatchObject({
      shipmentId: '7',
      orderNumber: '7/2026',
      clientId: 'c9',
      isAgency: true,
      contractorId: 'k1',
      kind: 'istovar',
      place: '1000 Ljubljana',
      countryCode: 'SI',
    });
  });

  it('takes the vehicle and driver from the stop of that kind', () => {
    const rows = buildTodayStops(
      [
        shipment('1', {
          cargo: [loading('a', { unloadingDueDate: '2026-06-16' })],
          vehicleStops: [
            stop({ id: 's1', vehicleId: 'v1', driverId: 'd1', loadingCargos: ids('a') }),
            stop({ id: 's2', vehicleId: 'v2', driverId: null as never, unloadingCargos: ids('a') }),
          ],
        }),
      ],
      TODAY
    );
    expect(rows.map((row) => [row.kind, row.vehicleId, row.driverId])).toEqual([
      ['utovar', 'v1', 'd1'],
      ['istovar', 'v2', undefined],
    ]);
  });

  it('is done only when every teret at the place is done', () => {
    const rows = buildTodayStops(
      [
        shipment('1', {
          cargo: [loading('a'), loading('b')],
          vehicleStops: [
            stop({ id: 's1', completedAt: '2026-06-16T08:00:00', loadingCargos: ids('a') }),
            stop({ id: 's2', loadingCargos: ids('b') }),
          ],
        }),
      ],
      TODAY
    );
    expect(rows.map((row) => row.done)).toEqual([false]);
  });

  it('uses the stop, not the load status, when there is one', () => {
    const rows = buildTodayStops(
      [
        shipment('1', {
          cargo: [loading('a', { loadStatus: LoadStatus.Unloaded })],
          vehicleStops: [stop({ loadingCargos: ids('a') })],
        }),
      ],
      TODAY
    );
    expect(rows[0].done).toBe(false);
  });

  it.each([
    ['utovar', LoadStatus.NotYetLoaded, false],
    ['utovar', LoadStatus.Loaded, true],
    ['utovar', LoadStatus.Unloaded, true],
    ['utovar', undefined, false],
    ['istovar', LoadStatus.NotYetLoaded, false],
    ['istovar', LoadStatus.Loaded, false],
    ['istovar', LoadStatus.Unloaded, true],
  ] as const)('without a stop, %s with %s is done: %s', (kind, loadStatus, done) => {
    const teret = kind === 'utovar' ? loading('a', { loadStatus }) : unloading('a', { loadStatus });
    const [row] = buildTodayStops([shipment('1', { isAgency: true, cargo: [teret] })], TODAY);
    expect(row).toMatchObject({ kind, done, vehicleId: undefined, driverId: undefined });
  });

  it('moves done rows after the open ones, keeping their order', () => {
    const rows = buildTodayStops(
      [
        shipment('1', { cargo: [loading('a', { loadStatus: LoadStatus.Loaded })] }),
        shipment('2', { cargo: [loading('b')] }),
        shipment('3', { cargo: [unloading('c', { loadStatus: LoadStatus.Unloaded })] }),
        shipment('4', { cargo: [unloading('d')] }),
      ],
      TODAY
    );
    expect(rows.map((row) => [row.shipmentId, row.kind, row.done])).toEqual([
      ['2', 'utovar', false],
      ['4', 'istovar', false],
      ['1', 'utovar', true],
      ['3', 'istovar', true],
    ]);
  });

  it('keeps the last copy of a nalog from both queries', () => {
    const before = shipment('1', { cargo: [loading('a')] });
    const after = shipment('1', { cargo: [loading('a', { loadStatus: LoadStatus.Loaded })] });
    const rows = buildTodayStops([before, after], TODAY);
    expect(rows.map((row) => row.done)).toEqual([true]);
  });
});
