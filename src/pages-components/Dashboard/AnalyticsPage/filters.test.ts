import { describe, expect, it } from 'vitest';

import {
  dateRangeToSelection,
  GRANULARITY,
  isIsoDate,
  isLastPeriodPartial,
  type PresetKey,
  PRESETS,
  previousRange,
  selectionRange,
  selectionToDateRange,
  toIso,
} from './filters';

const TODAY = new Date(2026, 10, 10, 9, 30); // utorak 10.11.2026.

describe('URL vocabulary', () => {
  it.each([
    ['dan', 'day'],
    ['tjedan', 'week'],
    ['mjesec', 'month'],
    ['godina', 'year'],
  ])('po=%s → %s', (param, key) => {
    expect(GRANULARITY.find((item) => item.param === param)?.key).toBe(key);
  });

  it('knows the razdoblje presets in picker order', () => {
    expect(PRESETS.map((preset) => [preset.key, preset.label])).toEqual([
      ['ytd', 'Od početka godine'],
      ['3m', 'Zadnja 3 mjeseca'],
      ['6m', 'Zadnjih 6 mjeseci'],
      ['12m', 'Zadnjih 12 mjeseci'],
      ['2y', 'Zadnje 2 godine'],
      ['5y', 'Zadnjih 5 godina'],
      ['sve', 'Svi datumi'],
    ]);
  });
});

describe('toIso', () => {
  it('formats the local calendar day', () => {
    expect(toIso(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    expect(toIso(new Date(2026, 11, 31, 0, 0))).toBe('2026-12-31');
  });
});

describe('isIsoDate', () => {
  it.each(['2028-02-29', '2026-12-31', '2026-01-01'])('accepts %s', (value) => expect(isIsoDate(value)).toBe(true));

  it.each([
    '2026-02-29',
    '2026-04-31',
    '2026-00-10',
    '2026-1-01',
    ' 2026-01-01',
    '2026-01-01T00:00',
    '',
    undefined,
    null,
    20260101,
    ['2026-01-01'],
  ])('rejects %j', (value) => expect(isIsoDate(value)).toBe(false));
});

describe('selectionRange', () => {
  it.each([
    ['3m', '2026-08-10'],
    ['12m', '2025-11-10'],
    ['2y', '2024-11-10'],
    ['5y', '2021-11-10'],
  ] as const)('%s starts on %s and ends today', (preset, from) => {
    expect(selectionRange({ preset }, TODAY)).toEqual({ from, to: '2026-11-10' });
  });

  it.each([
    ['3m from 31 May', new Date(2026, 4, 31), '3m', '2026-02-28'],
    ['6m from 31 August of a leap year', new Date(2028, 7, 31), '6m', '2028-02-29'],
    ['12m from a leap day', new Date(2028, 1, 29), '12m', '2027-02-28'],
    ['2y from a leap day', new Date(2028, 1, 29), '2y', '2026-02-28'],
  ] as const)('clamps %s to the month end', (_, today, preset, from) => {
    expect(selectionRange({ preset }, today)).toEqual({ from, to: toIso(today) });
  });

  it('is a single day for ytd on 1 January', () => {
    expect(selectionRange({ preset: 'ytd' }, new Date(2026, 0, 1, 8))).toEqual({
      from: '2026-01-01',
      to: '2026-01-01',
    });
  });

  it('passes a custom range through as is', () => {
    expect(selectionRange({ from: '2025-12-01', to: '2026-01-31' }, TODAY)).toEqual({
      from: '2025-12-01',
      to: '2026-01-31',
    });
  });
});

describe('previousRange', () => {
  it.each([
    ['6m', '2025-11-10', '2026-05-09', 'prethodnih 6 mjeseci'],
    ['12m', '2024-11-10', '2025-11-09', 'prethodnih 12 mjeseci'],
    ['2y', '2022-11-10', '2024-11-09', 'prethodne 2 godine'],
    ['5y', '2016-11-10', '2021-11-09', 'prethodnih 5 godina'],
  ] as const)('%s compares with %s – %s', (preset, from, to, label) => {
    expect(previousRange({ preset }, TODAY)).toEqual({ from, to, label });
  });

  it('ends the day before the current range starts, also at a month end', () => {
    const today = new Date(2026, 4, 31);
    expect(selectionRange({ preset: '3m' }, today).from).toBe('2026-02-28');
    expect(previousRange({ preset: '3m' }, today)).toEqual({
      from: '2025-11-28',
      to: '2026-02-27',
      label: 'prethodna 3 mjeseca',
    });
  });

  it.each([
    ['on 1 January', new Date(2026, 0, 1), { from: '2025-01-01', to: '2025-01-01', label: 'isto razdoblje 2025.' }],
    ['on 31 December', new Date(2026, 11, 31), { from: '2025-01-01', to: '2025-12-31', label: 'isto razdoblje 2025.' }],
    ['on a leap day', new Date(2028, 1, 29), { from: '2027-01-01', to: '2027-02-28', label: 'isto razdoblje 2027.' }],
  ])('ytd takes the same dates a year back %s', (_, today, range) => {
    expect(previousRange({ preset: 'ytd' }, today)).toEqual(range);
  });

  it.each([
    ['a single day', '2026-03-01', '2026-03-01', '2026-02-28', '2026-02-28'],
    ['a month into a leap February', '2028-03-01', '2028-03-31', '2028-01-30', '2028-02-29'],
    ['January back over new year', '2026-01-01', '2026-01-31', '2025-12-01', '2025-12-31'],
    ['a range across new year', '2025-12-15', '2026-01-14', '2025-11-14', '2025-12-14'],
  ])('a custom range takes the same number of days before (%s)', (_, from, to, previousFrom, previousTo) => {
    expect(previousRange({ from, to }, TODAY)).toEqual({
      from: previousFrom,
      to: previousTo,
      label: 'prethodno razdoblje',
    });
  });
});

describe('selectionToDateRange', () => {
  it('turns a custom range into local midnights', () => {
    expect(selectionToDateRange({ from: '2026-03-01', to: '2026-03-31' }, TODAY)).toEqual({
      from: new Date(2026, 2, 1),
      to: new Date(2026, 2, 31),
    });
  });

  it('gives the preset range ending today, and nothing for „Svi datumi”', () => {
    expect(selectionToDateRange({ preset: 'ytd' }, TODAY)).toEqual({ from: new Date(2026, 0, 1), to: TODAY });
    expect(selectionToDateRange({ preset: 'sve' }, TODAY)).toBeUndefined();
  });
});

describe('dateRangeToSelection', () => {
  it.each(PRESETS.map((preset) => preset.key))('round-trips the %s preset', (preset: PresetKey) => {
    expect(dateRangeToSelection(selectionToDateRange({ preset }, TODAY), TODAY)).toEqual({ preset });
  });

  it('recognises a preset whatever the time of the picked days', () => {
    expect(dateRangeToSelection({ from: new Date(2026, 7, 10), to: new Date(2026, 10, 10, 23, 59) }, TODAY)).toEqual({
      preset: '3m',
    });
  });

  it('keeps a range that ends before today as custom', () => {
    expect(dateRangeToSelection({ from: new Date(2026, 4, 10), to: new Date(2026, 10, 9) }, TODAY)).toEqual({
      from: '2026-05-10',
      to: '2026-11-09',
    });
  });

  it('makes a single day of a range without an end', () => {
    expect(dateRangeToSelection({ from: new Date(2026, 9, 1), to: undefined }, TODAY)).toEqual({
      from: '2026-10-01',
      to: '2026-10-01',
    });
  });

  it('is „Svi datumi” without a start', () => {
    expect(dateRangeToSelection({ from: undefined, to: new Date(2026, 9, 1) }, TODAY)).toEqual({ preset: 'sve' });
  });
});

describe('isLastPeriodPartial', () => {
  it.each([
    ['ends today', { from: '2026-11-01', to: '2026-11-10' }, true],
    ['ends after today', { from: '2026-11-01', to: '2026-12-31' }, true],
    ['ended yesterday', { from: '2026-11-01', to: '2026-11-09' }, false],
    ['has no end', { from: '2026-11-01' }, true],
  ])('the range %s → %s', (_, range, partial) => {
    expect(isLastPeriodPartial(range, TODAY)).toBe(partial);
  });
});
