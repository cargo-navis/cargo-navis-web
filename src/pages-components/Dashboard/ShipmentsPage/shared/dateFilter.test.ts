import { describe, expect, it } from 'vitest';

import { dateFilterPatch, isInDateFilter, readDateFilter, withOneDateFilter } from './dateFilter';

describe('readDateFilter', () => {
  it('no dates: none', () => {
    expect(readDateFilter({ clientId: 'c1' })).toBeUndefined();
  });

  it('reads the type from the pair that is set', () => {
    expect(readDateFilter({ activityDateFrom: '2026-11-26', activityDateTo: '2026-11-26' })).toEqual({
      type: 'any',
      from: '2026-11-26',
      to: '2026-11-26',
    });
    expect(readDateFilter({ loadingReadyDateFrom: '2026-11-14' })).toEqual({
      type: 'loading',
      from: '2026-11-14',
      to: undefined,
    });
    expect(readDateFilter({ unloadingDueDateTo: '2026-12-06' })).toEqual({
      type: 'unloading',
      from: undefined,
      to: '2026-12-06',
    });
  });

  it('several pairs (an old saved set): Utovar ili istovar, then Utovar, wins', () => {
    expect(readDateFilter({ loadingReadyDateFrom: '2026-11-14', unloadingDueDateFrom: '2026-12-06' })?.type).toBe(
      'loading'
    );
  });
});

describe('dateFilterPatch', () => {
  it('sets one pair and clears the other two', () => {
    expect(dateFilterPatch('unloading', '2026-11-26', '2026-11-27')).toEqual({
      activityDateFrom: undefined,
      activityDateTo: undefined,
      loadingReadyDateFrom: undefined,
      loadingReadyDateTo: undefined,
      unloadingDueDateFrom: '2026-11-26',
      unloadingDueDateTo: '2026-11-27',
    });
  });

  it('no range clears every date', () => {
    expect(Object.values(dateFilterPatch('any')).every((value) => value === undefined)).toBe(true);
  });
});

describe('withOneDateFilter', () => {
  it('keeps the utovar range of an old set with both, and the other filters', () => {
    expect(
      withOneDateFilter({ clientId: 'c1', loadingReadyDateFrom: '2026-11-14', unloadingDueDateFrom: '2026-12-06' })
    ).toEqual({
      clientId: 'c1',
      activityDateFrom: undefined,
      activityDateTo: undefined,
      loadingReadyDateFrom: '2026-11-14',
      loadingReadyDateTo: undefined,
      unloadingDueDateFrom: undefined,
      unloadingDueDateTo: undefined,
    });
  });

  it('no date filter: unchanged', () => {
    const filters = { clientId: 'c1' };
    expect(withOneDateFilter(filters)).toBe(filters);
  });
});

describe('isInDateFilter', () => {
  const sutra = { type: 'any' as const, from: '2026-11-26', to: '2026-11-26' };

  it('inclusive range, the time part ignored', () => {
    expect(isInDateFilter('2026-11-26', sutra)).toBe(true);
    expect(isInDateFilter('2026-11-26T06:00:00', sutra)).toBe(true);
    expect(isInDateFilter('2026-11-25', sutra)).toBe(false);
    expect(isInDateFilter('2026-11-27', sutra)).toBe(false);
  });

  it('no date never matches; an open end matches everything after the start', () => {
    expect(isInDateFilter(null, sutra)).toBe(false);
    expect(isInDateFilter(undefined, sutra)).toBe(false);
    expect(isInDateFilter('2027-01-01', { type: 'loading', from: '2026-11-14' })).toBe(true);
  });
});
