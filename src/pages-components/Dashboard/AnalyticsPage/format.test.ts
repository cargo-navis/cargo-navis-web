import { describe, expect, it } from 'vitest';

import { compact, eur, int, percent, periodLabel } from './format';

const TODAY = new Date(2026, 10, 10, 9, 30); // utorak 10.11.2026.

/** Intl puts no-break spaces before „€” and „tis.”. */
const spaces = (text: string) => text.replace(/\s/g, ' ');
const MINUS = '−';

describe('numbers', () => {
  it.each([
    [0, '0 €'],
    [1234.6, '1.235 €'],
    [-1234.6, `${MINUS}1.235 €`],
  ])('eur(%d) → %s', (value, text) => expect(spaces(eur(value))).toBe(text));

  it.each([
    [0, '0'],
    [2.4, '2'],
    [1234.5, '1.235'],
    [1234567, '1.234.567'],
  ])('int(%d) → %s', (value, text) => expect(int(value)).toBe(text));

  it.each([
    [0, '0'],
    [950, '950'],
    [1000, '1 tis.'],
    [1500, '1,5 tis.'],
    [62000, '62 tis.'],
    [1234567, '1,2 mil.'],
  ])('compact(%d) → %s', (value, text) => expect(spaces(compact(value))).toBe(text));

  it.each([
    [0, '0,0 %'],
    [12.36, '12,4 %'],
    [100, '100,0 %'],
    [-5, `${MINUS}5,0 %`],
  ])('percent(%d) → %s', (value, text) => expect(percent(value)).toBe(text));
});

describe('periodLabel · day', () => {
  it.each([
    ['2026-11-15', { label: '15.11.', long: 'nedjelja, 15.11.2026.' }],
    ['2025-01-01', { label: '1.1.', long: 'srijeda, 1.1.2025.' }],
    ['2028-02-29', { label: '29.2.', long: 'utorak, 29.2.2028.' }],
  ])('%s', (period, label) => expect(periodLabel(period, 'day', TODAY)).toEqual(label));
});

describe('periodLabel · week', () => {
  it('assumes seven days when the API gives only the start', () => {
    expect(periodLabel('2026-11-09', 'week', TODAY)).toEqual({
      label: 'T46',
      long: '46. tjedan 2026. · 9.11. – 15.11.2026.',
    });
  });

  it('knows week 53', () => {
    expect(periodLabel('2026-12-28 - 2027-01-03', 'week', TODAY)).toEqual({
      label: 'T53',
      long: '53. tjedan 2026. · 28.12. – 3.1.2027.',
    });
  });

  it('marks weeks of another year', () => {
    expect(periodLabel('2025-11-10 - 2025-11-16', 'week', TODAY).label).toBe('T46 ’25');
  });

  it('takes the year of the ISO week, not of its first day', () => {
    expect(periodLabel('2025-12-29 - 2026-01-04', 'week', TODAY).long).toBe('1. tjedan 2026. · 29.12. – 4.1.2026.');
    expect(periodLabel('2025-12-29 - 2026-01-04', 'week', new Date(2025, 11, 30)).label).toBe('T1 ’26');
  });
});

describe('periodLabel · month', () => {
  it.each([
    ['01', 'Sij', 'siječanj'],
    ['02', 'Velj', 'veljača'],
    ['03', 'Ožu', 'ožujak'],
    ['04', 'Tra', 'travanj'],
    ['05', 'Svi', 'svibanj'],
    ['06', 'Lip', 'lipanj'],
    ['07', 'Srp', 'srpanj'],
    ['08', 'Kol', 'kolovoz'],
    ['09', 'Ruj', 'rujan'],
    ['10', 'Lis', 'listopad'],
    ['11', 'Stu', 'studeni'],
    ['12', 'Pro', 'prosinac'],
  ])('2026-%s → %s', (month, label, long) => {
    expect(periodLabel(`2026-${month}`, 'month', TODAY)).toEqual({ label, long: `${long} 2026.` });
  });

  it('marks months of a later year too', () => {
    expect(periodLabel('2027-01', 'month', TODAY)).toEqual({ label: 'Sij ’27', long: 'siječanj 2027.' });
  });
});

describe('periodLabel · year', () => {
  it('never adds a year suffix', () => {
    expect(periodLabel('2025', 'year', TODAY)).toEqual({ label: '2025', long: '2025.' });
  });
});
