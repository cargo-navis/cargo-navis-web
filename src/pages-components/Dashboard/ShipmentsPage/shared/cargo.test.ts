import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Cargo } from '@/lib/api';
import { LoadStatus } from '@/lib/api/shipments';

import {
  agencyStatusBadgeLabel,
  cargoContentsLabel,
  cargoDimensions,
  cargoQuantity,
  cargoState,
  cargoTotals,
  isCustomCargo,
  isOversize,
  isPast,
  palletLabel,
} from './cargo';

const pallets = (palleteAmount?: number, palleteType = 'euro', overrides: Partial<Cargo> = {}) =>
  ({
    id: 'c1',
    weight: 1000,
    ldm: 2.4,
    metadata: { type: 'standard', palleteType, palleteAmount },
    ...overrides,
  }) as unknown as Cargo;

const custom = (
  dimensions: { length?: number; width?: number; height?: number } = {},
  overrides: Partial<Cargo> = {}
) =>
  ({
    id: 'c2',
    weight: 3100,
    ldm: 3.68,
    metadata: { type: 'nonstandard', ...dimensions },
    ...overrides,
  }) as unknown as Cargo;

describe('isCustomCargo / isOversize', () => {
  it('custom = nonstandard', () => {
    expect(isCustomCargo(custom())).toBe(true);
    expect(isCustomCargo(pallets(1))).toBe(false);
    expect(isCustomCargo({ id: 'x' } as Cargo)).toBe(false);
  });

  it.each([
    [{ width: 2.55, height: 3, length: 13.6 }, false],
    [{ width: 2.56 }, true],
    [{ height: 3.01 }, true],
    [{ length: 13.61 }, true],
    [{}, false],
  ])('oversize %j → %s', (dimensions, expected) => {
    expect(isOversize(custom(dimensions))).toBe(expected);
  });

  it('pallets are never oversize', () => {
    expect(isOversize({ ...pallets(1), metadata: { ...pallets(1).metadata, width: 5 } })).toBe(false);
  });
});

describe('cargo labels', () => {
  it.each([
    ['small', 'mala paleta 80×60'],
    ['euro', 'EUR paleta 120×80'],
    ['ship', 'brodska paleta 120×100'],
    ['industry', 'industrijska paleta 100×100'],
    ['jumbo', 'jumbo paleta 120×120'],
    ['barrel', 'paleta'],
  ])('pallet %s → %s', (type, label) => {
    expect(palletLabel(pallets(1, type))).toBe(label);
  });

  it('dimensions in Croatian numbers, dash for a missing one', () => {
    expect(cargoDimensions(custom({ length: 4, width: 2.5, height: 3.2 }))).toBe('4 × 2,5 × 3,2 m');
    expect(cargoDimensions(custom({ length: 13.555, width: 2.55 }))).toBe('13,56 × 2,55 × — m');
    expect(cargoDimensions(custom())).toBeNull();
    expect(cargoDimensions(custom({ length: 0, width: 0, height: 0 }))).toBeNull();
  });

  it('quantity: pallets, dimensions or Izvanredni teret', () => {
    expect(cargoQuantity(pallets(14))).toBe('14 × EUR paleta 120×80');
    expect(cargoQuantity(pallets(undefined))).toBe('0 × EUR paleta 120×80');
    expect(cargoQuantity(custom({ length: 4, width: 2.5, height: 3.2 }))).toBe('4 × 2,5 × 3,2 m');
    expect(cargoQuantity(custom())).toBe('Izvanredni teret');
  });
});

describe('cargoTotals / cargoContentsLabel', () => {
  it('sums LDM and weight; pallets only of pallet cargo', () => {
    const custom5 = custom({}, { metadata: { type: 'nonstandard', palleteAmount: 5 } as never });
    expect(cargoTotals([pallets(10), pallets(4), custom5])).toEqual({
      ldm: 2.4 + 2.4 + 3.68,
      weightKg: 5100,
      pallets: 14,
    });
    expect(cargoTotals([])).toEqual({ ldm: 0, weightKg: 0, pallets: 0 });
  });

  it('treats missing numbers as 0', () => {
    expect(cargoTotals([pallets(undefined, 'euro', { ldm: undefined, weight: undefined } as never)])).toEqual({
      ldm: 0,
      weightKg: 0,
      pallets: 0,
    });
  });

  it.each([
    ['pallets only', [pallets(10), pallets(4)], '14 pal'],
    ['nothing', [], '0 pal'],
    ['one custom piece', [custom({ length: 4, width: 2.5, height: 3.2 })], '4 × 2,5 × 3,2 m'],
    ['one custom piece, no dimensions', [custom()], 'izvanredni'],
    ['custom pieces', [custom(), custom()], '2 kom'],
    ['both', [pallets(10), custom()], '10 pal + 1 kom'],
    ['custom with 0 pallets', [pallets(0), custom(), custom()], '2 kom'],
  ])('%s → %s', (_, cargos, label) => {
    expect(cargoContentsLabel(cargos)).toBe(label);
  });
});

describe('agencyStatusBadgeLabel', () => {
  it.each([
    [LoadStatus.NotYetLoaded, 'Nije utovaren'],
    [LoadStatus.Loaded, 'Označeno: Utovaren'],
    [LoadStatus.Unloaded, 'Označeno: Istovaren'],
  ])('%s → %s', (status, label) => {
    expect(agencyStatusBadgeLabel(status)).toBe(label);
  });
});

describe('isPast / cargoState', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 5, 16, 9));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    [null, false],
    [undefined, false],
    ['', false],
    ['2026-06-16', false],
    ['2026-06-17', false],
    ['2026-06-15', true],
  ])('isPast(%j) → %s', (date, expected) => {
    expect(isPast(date)).toBe(expected);
  });

  const state = (loadStatus: LoadStatus | undefined, loadingReadyDate?: string, unloadingDueDate?: string) =>
    cargoState(pallets(1, 'euro', { loadStatus, loadingReadyDate, unloadingDueDate }));

  it.each([
    ['no status, utovar ahead', undefined, '2026-06-16', undefined, 'waiting'],
    ['no status, utovar passed', undefined, '2026-06-15', undefined, 'late'],
    ['waiting, no date', LoadStatus.NotYetLoaded, undefined, '2026-06-01', 'waiting'],
    ['loaded, istovar ahead', LoadStatus.Loaded, '2026-06-01', '2026-06-16', 'loaded'],
    ['loaded, istovar passed', LoadStatus.Loaded, '2026-06-20', '2026-06-15', 'late'],
    ['unloaded, dates passed', LoadStatus.Unloaded, '2026-06-01', '2026-06-02', 'unloaded'],
  ])('%s → %s', (_, loadStatus, loading, unloading, expected) => {
    expect(state(loadStatus, loading, unloading)).toBe(expected);
  });
});
