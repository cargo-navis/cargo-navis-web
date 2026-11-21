import { describe, expect, it } from 'vitest';

import {
  dateRangeToSelection,
  isIsoDate,
  isLastPeriodPartial,
  previousRange,
  selectionRange,
  selectionToDateRange,
} from './filters';
import { eur, percent, periodLabel } from './format';
import { mergePeriods } from './usePeriods';

const TODAY = new Date(2026, 10, 10, 9, 30); // utorak 10.11.2026.

describe('periodLabel', () => {
  it('labels days, weeks, months and years', () => {
    expect(periodLabel('2026-11-10', 'day', TODAY)).toEqual({ label: '10.11.', long: 'utorak, 10.11.2026.' });
    expect(periodLabel('2026-11-09 - 2026-11-15', 'week', TODAY)).toEqual({
      label: 'T46',
      long: '46. tjedan 2026. · 9.11. – 15.11.2026.',
    });
    expect(periodLabel('2026-11', 'month', TODAY)).toEqual({ label: 'Stu', long: 'studeni 2026.' });
    expect(periodLabel('2025-01', 'month', TODAY)).toEqual({ label: 'Sij ’25', long: 'siječanj 2025.' });
    expect(periodLabel('2026', 'year', TODAY)).toEqual({ label: '2026', long: '2026.' });
  });

  it('uses the ISO week year across new year', () => {
    expect(periodLabel('2025-12-29 - 2026-01-04', 'week', TODAY).label).toBe('T1');
  });
});

describe('format', () => {
  it('formats euros and percentages the Croatian way', () => {
    expect(eur(61800).replace(/\s/g, ' ')).toBe('61.800 €');
    expect(percent(12.345)).toBe('12,3 %');
  });
});

describe('filters', () => {
  it('accepts only real calendar dates from the URL', () => {
    expect(isIsoDate('2026-02-28')).toBe(true);
    expect(isIsoDate('2026-02-31')).toBe(false);
    expect(isIsoDate('2026-13-01')).toBe(false);
    expect(isIsoDate('26-02-01')).toBe(false);
  });

  it('turns presets into API ranges', () => {
    expect(selectionRange({ preset: '6m' }, TODAY)).toEqual({ from: '2026-05-10', to: '2026-11-10' });
    expect(selectionRange({ preset: 'ytd' }, TODAY)).toEqual({ from: '2026-01-01', to: '2026-11-10' });
    expect(selectionRange({ preset: 'sve' }, TODAY)).toEqual({});
    expect(selectionRange({ from: '2026-03-01', to: '2026-03-31' }, TODAY)).toEqual({
      from: '2026-03-01',
      to: '2026-03-31',
    });
  });

  it('compares with the same length right before', () => {
    expect(previousRange({ preset: '3m' }, TODAY)).toEqual({
      from: '2026-05-10',
      to: '2026-08-09',
      label: 'prethodna 3 mjeseca',
    });
    expect(previousRange({ preset: 'ytd' }, TODAY)).toEqual({
      from: '2025-01-01',
      to: '2025-11-10',
      label: 'isto razdoblje 2025.',
    });
    expect(previousRange({ from: '2026-03-01', to: '2026-03-31' }, TODAY)).toEqual({
      from: '2026-01-29',
      to: '2026-02-28',
      label: 'prethodno razdoblje',
    });
    expect(previousRange({ preset: 'sve' }, TODAY)).toBeUndefined();
  });

  it('maps a picked range back to a preset or a custom range', () => {
    expect(dateRangeToSelection(selectionToDateRange({ preset: '12m' }, TODAY), TODAY)).toEqual({ preset: '12m' });
    expect(dateRangeToSelection(undefined, TODAY)).toEqual({ preset: 'sve' });
    expect(dateRangeToSelection({ from: new Date(2026, 2, 1), to: new Date(2026, 2, 31) }, TODAY)).toEqual({
      from: '2026-03-01',
      to: '2026-03-31',
    });
  });

  it('marks the last period as running only when the range reaches today', () => {
    expect(isLastPeriodPartial({ from: '2026-05-10', to: '2026-11-10' }, TODAY)).toBe(true);
    expect(isLastPeriodPartial({}, TODAY)).toBe(true);
    expect(isLastPeriodPartial({ from: '2026-03-01', to: '2026-03-31' }, TODAY)).toBe(false);
  });
});

describe('mergePeriods', () => {
  it('joins counts and prices by period and flags the running one', () => {
    const periods = mergePeriods(
      {
        totalRegular: 3,
        totalAgency: 1,
        averageRegular: 1.5,
        averageAgency: 0.5,
        granularity: 'month',
        periods: [
          { period: '2026-10', countRegular: 2, countAgency: 1 },
          { period: '2026-11', countRegular: 1, countAgency: 0 },
        ],
      },
      {
        totalRevenueRegular: 300,
        totalRevenueAgency: 120,
        totalCostAgency: 100,
        averageRevenueRegular: 150,
        averageRevenueAgency: 60,
        averageCostAgency: 50,
        granularity: 'month',
        periods: [{ period: '2026-10', revenueRegular: 300, revenueAgency: 120, costAgency: 100 }],
      },
      { partial: true, now: TODAY }
    );
    expect(periods.map((period) => [period.label, period.partial, period.revenueRegular])).toEqual([
      ['Lis', false, 300],
      ['Stu', true, 0],
    ]);
  });
});
