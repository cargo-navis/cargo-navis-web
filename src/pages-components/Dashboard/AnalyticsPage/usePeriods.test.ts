import { describe, expect, it } from 'vitest';

import type { Granularity, ShipmentAnalytics, ShipmentPriceAnalytics } from '@/lib/api';

import { mergePeriods } from './usePeriods';

const TODAY = new Date(2026, 10, 10, 9, 30); // utorak 10.11.2026.

const counts = (granularity: Granularity, periods: ShipmentAnalytics['periods']): ShipmentAnalytics => ({
  totalRegular: 0,
  totalAgency: 0,
  averageRegular: 0,
  averageAgency: 0,
  granularity,
  periods,
});

const prices = (periods: ShipmentPriceAnalytics['periods']): ShipmentPriceAnalytics => ({
  totalRevenueRegular: 0,
  totalRevenueAgency: 0,
  totalCostAgency: 0,
  averageRevenueRegular: 0,
  averageRevenueAgency: 0,
  averageCostAgency: 0,
  granularity: 'month',
  periods,
});

const count = (period: string, countRegular = 1, countAgency = 0) => ({ period, countRegular, countAgency });
const price = (period: string, revenueRegular = 100, revenueAgency = 50, costAgency = 40) => ({
  period,
  revenueRegular,
  revenueAgency,
  costAgency,
});

describe('mergePeriods', () => {
  it('is empty without periods', () => {
    expect(mergePeriods(counts('month', []), prices([price('2026-11')]), { partial: true, now: TODAY })).toEqual([]);
  });

  it('builds one full row per counted period', () => {
    expect(
      mergePeriods(counts('month', [count('2026-11', 4, 2)]), prices([price('2026-11', 900, 300, 250)]), {
        partial: false,
        now: TODAY,
      })
    ).toEqual([
      {
        key: '2026-11',
        label: 'Stu',
        long: 'studeni 2026.',
        partial: false,
        countRegular: 4,
        countAgency: 2,
        revenueRegular: 900,
        revenueAgency: 300,
        costAgency: 250,
      },
    ]);
  });

  it('follows the order of the counts and ignores prices of other periods', () => {
    const periods = mergePeriods(
      counts('month', [count('2026-09'), count('2026-10')]),
      prices([price('2026-10', 200), price('2026-08', 999), price('2026-09', 100)]),
      { partial: false, now: TODAY }
    );
    expect(periods.map((period) => [period.key, period.revenueRegular])).toEqual([
      ['2026-09', 100],
      ['2026-10', 200],
    ]);
  });

  it('flags only the last period, and only when the range is running', () => {
    const data = counts('month', [count('2026-09'), count('2026-10'), count('2026-11')]);
    const flags = (partial: boolean) =>
      mergePeriods(data, prices([]), { partial, now: TODAY }).map((period) => period.partial);
    expect(flags(true)).toEqual([false, false, true]);
    expect(flags(false)).toEqual([false, false, false]);
  });

  it('flags a single running period', () => {
    const [period] = mergePeriods(counts('year', [count('2026')]), prices([]), { partial: true, now: TODAY });
    expect(period).toMatchObject({ label: '2026', partial: true, revenueRegular: 0, revenueAgency: 0, costAgency: 0 });
  });

  it('labels by the granularity of the counts', () => {
    const [period] = mergePeriods(counts('week', [count('2026-11-09 - 2026-11-15')]), prices([]), {
      partial: false,
      now: TODAY,
    });
    expect(period.label).toBe('T46');
  });
});
