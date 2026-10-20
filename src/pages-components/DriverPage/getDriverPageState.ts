import { isDriverLinkExpiredError } from '@/lib/services/driverBackendService';

import type { DriverSessionStatus } from './useDriverSession';

export type DriverPageState = 'loading' | 'expired' | 'session-error' | 'stops-error' | 'ready';

export function getDriverPageState({
  sessionStatus,
  hasStops,
  accountError,
  stopsError,
}: {
  sessionStatus: DriverSessionStatus;
  hasStops: boolean;
  accountError: unknown;
  stopsError: unknown;
}): DriverPageState {
  if (sessionStatus === 'expired' || isDriverLinkExpiredError(accountError) || isDriverLinkExpiredError(stopsError)) {
    return 'expired';
  }
  if (sessionStatus === 'error') return 'session-error';
  // A failed background refetch keeps the cached stops on screen; only a failed first load blocks the page.
  if (stopsError && !hasStops) return 'stops-error';
  if (!hasStops) return 'loading';
  return 'ready';
}
