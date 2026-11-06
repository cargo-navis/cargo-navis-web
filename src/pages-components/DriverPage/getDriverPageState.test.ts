import { describe, expect, it } from 'vitest';

import { DriverLinkExpiredError } from '@/lib/services/driverBackendService';

import { getDriverPageState } from './getDriverPageState';

const base = { sessionStatus: 'ready' as const, hasStops: true, accountError: null, stopsError: null };

describe('getDriverPageState', () => {
  it('keeps showing cached stops when a background refetch fails', () => {
    expect(getDriverPageState({ ...base, stopsError: new Error('Network Error') })).toBe('ready');
  });

  it('shows stops error when the first load fails', () => {
    expect(getDriverPageState({ ...base, hasStops: false, stopsError: new Error('Network Error') })).toBe(
      'stops-error'
    );
  });

  it('shows expired when a refetch fails with an expired link, even with cached stops', () => {
    expect(getDriverPageState({ ...base, stopsError: new DriverLinkExpiredError() })).toBe('expired');
  });

  it('shows loading until the session is ready', () => {
    expect(getDriverPageState({ ...base, sessionStatus: 'loading', hasStops: false })).toBe('loading');
  });
});
