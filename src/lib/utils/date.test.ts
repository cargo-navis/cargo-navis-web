import { describe, expect, it } from 'vitest';

import {
  daysFromToday,
  formatDate,
  formatDateShort,
  formatDateTime,
  formatExpiry,
  formatLate,
  formatRelativeDay,
  getExpiryState,
} from './date';

const NOW = new Date(2026, 10, 10, 15, 30); // 10.11.2026. 15:30 local

describe('formatDate', () => {
  it('has no leading zeros and no spaces', () => {
    expect(formatDate(new Date(2026, 10, 7))).toBe('7.11.2026.');
    expect(formatDate('2026-01-05')).toBe('5.1.2026.');
    expect(formatDateShort(new Date(2026, 10, 7))).toBe('7.11.');
    expect(formatDateShort('2026-03-09T23:15:00')).toBe('9.3.');
  });

  it('adds the time', () => {
    expect(formatDateTime(new Date(2026, 10, 7, 8, 42))).toBe('7.11.2026. 08:42');
    expect(formatDateTime(new Date(2026, 10, 7, 8, 42), { short: true })).toBe('7.11. 08:42');
  });
});

describe('relative days', () => {
  it('counts calendar days, not 24h blocks', () => {
    expect(daysFromToday(new Date(2026, 10, 11, 0, 5), NOW)).toBe(1);
    expect(daysFromToday(new Date(2026, 10, 10, 23, 59), NOW)).toBe(0);
    expect(daysFromToday('2026-11-08', NOW)).toBe(-2);
  });

  it.each([
    ['2026-11-10', 'danas'],
    ['2026-11-11', 'sutra'],
    ['2026-11-09', 'jučer'],
    ['2026-11-13', 'za 3 dana'],
    ['2026-12-01', 'za 21 dan'],
    ['2026-11-08', 'prije 2 dana'],
  ])('%s → %s', (date, label) => {
    expect(formatRelativeDay(date, NOW)).toBe(label);
  });

  it('says how late', () => {
    expect(formatLate(2)).toBe('Kasni 2 dana');
    expect(formatLate(1)).toBe('Kasni 1 dan');
    expect(formatLate(5, { short: true })).toBe('Kasni 5 d');
    expect(formatLate(0)).toBe('Kasni');
  });
});

describe('expiry', () => {
  it('starts warning 30 days ahead', () => {
    expect(getExpiryState(undefined, NOW)).toBe('missing');
    expect(getExpiryState('2026-11-02', NOW)).toBe('expired');
    expect(getExpiryState('2026-11-10', NOW)).toBe('soon');
    expect(getExpiryState('2026-12-10', NOW)).toBe('soon');
    expect(getExpiryState('2026-12-11', NOW)).toBe('ok');
  });

  it('labels expired and soon', () => {
    expect(formatExpiry('2026-11-02', NOW)).toBe('Isteklo prije 8 d');
    expect(formatExpiry('2026-11-28', NOW)).toBe('Istječe za 18 d');
    expect(formatExpiry('2026-11-10', NOW)).toBe('Istječe danas');
    expect(formatExpiry('2027-05-01', NOW)).toBeNull();
    expect(formatExpiry(null, NOW)).toBeNull();
  });
});
