import { useEffect, useState } from 'react';

import { driverBackend, isDriverLinkExpiredError } from '@/lib/services/driverBackendService';

export type DriverSessionStatus = 'loading' | 'ready' | 'expired' | 'error';

export function useDriverSession(linkToken: string | undefined) {
  const [status, setStatus] = useState<DriverSessionStatus>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!linkToken) return;

    let isCancelled = false;
    setStatus('loading');

    driverBackend
      .startSession(linkToken)
      .then(() => !isCancelled && setStatus('ready'))
      .catch((error) => !isCancelled && setStatus(isDriverLinkExpiredError(error) ? 'expired' : 'error'));

    return () => {
      isCancelled = true;
    };
  }, [linkToken, attempt]);

  return { status, retry: () => setAttempt((value) => value + 1) };
}
