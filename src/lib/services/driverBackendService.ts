import axios, {
  type AxiosAdapter,
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import type { DriverTokenExchangeResponse } from '@/lib/api/driver.d';
import { getBackendBaseUrl } from '@/lib/utils/backendBaseUrl';

import { readAccessToken } from './readAccessToken';
import { createSingleFlight } from './singleFlight';

type AxiosFunction = <T>(url: string, config?: AxiosRequestConfig & { fullResponse?: boolean }) => Promise<T>;
type AxiosDataFunction = <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig & { fullResponse?: boolean }
) => Promise<T>;

type DriverRequest = InternalAxiosRequestConfig & { fullResponse?: boolean; _retried?: boolean };

/** The WhatsApp link token can no longer be exchanged; the driver has to open a newer link. */
export class DriverLinkExpiredError extends Error {
  constructor() {
    super('Driver link expired');
    this.name = 'DriverLinkExpiredError';
  }
}

export function isDriverLinkExpiredError(error: unknown): error is DriverLinkExpiredError {
  return error instanceof DriverLinkExpiredError;
}

function isClientError(error: unknown) {
  const status = (error as AxiosError)?.response?.status;
  return status !== undefined && status >= 400 && status < 500;
}

/**
 * API client for the driver portal. Kept apart from the dispatcher `backend` client: the driver JWT lives only
 * in memory and comes from exchanging the WhatsApp link token or from the httpOnly refresh cookie that the
 * exchange sets. A 401 never redirects to /login.
 */
export function createDriverBackendService({ adapter }: { adapter?: AxiosAdapter } = {}) {
  const baseURL = getBackendBaseUrl();
  // Exchange and refresh set or read the refresh cookie, so they are sent with credentials.
  const authClient = axios.create({ baseURL, adapter, withCredentials: true });
  const instance = axios.create({ baseURL, adapter });

  let accessToken: string | null = null;
  // Last link that exchanged successfully; a fallback while it is still valid (see recoverSession).
  let linkToken: string | null = null;

  // Exchange and refresh answer in the API envelope (see readAccessToken).
  function storeAccessToken({ data }: AxiosResponse<{ data?: DriverTokenExchangeResponse }>) {
    accessToken = readAccessToken(data);
  }

  function toSessionError(error: unknown) {
    return isClientError(error) ? new DriverLinkExpiredError() : error;
  }

  async function exchange(linkToken: string) {
    const result = await authClient.post('/auth/exchange', { token: linkToken });
    return storeAccessToken(result);
  }

  // Parallel callers share one in-flight refresh.
  const refresh = createSingleFlight(() =>
    authClient
      .post('/auth/refresh')
      .then(storeAccessToken)
      .catch((error) => {
        throw toSessionError(error);
      })
  );

  // After a 401: refresh, or re-exchange the link if refresh is rejected because the httpOnly refresh cookie is
  // missing (not set, blocked or cleared by the browser) or was replaced by a dashboard login in the same browser.
  // The link dies 15 minutes after first use, so this fallback is short-lived.
  const recoverSession = createSingleFlight(async () => {
    try {
      await refresh();
    } catch (error) {
      if (!isDriverLinkExpiredError(error) || !linkToken) throw error;
      await exchange(linkToken).catch((exchangeError) => {
        throw toSessionError(exchangeError);
      });
    }
  });

  /**
   * A link always wins, so a newer link (or another driver's) replaces the session. A used-up link falls back to
   * the refresh cookie, e.g. the installed app reopening an old link URL.
   */
  async function startSession(newLinkToken: string | null) {
    accessToken = null;
    linkToken = null;

    if (newLinkToken) {
      try {
        await exchange(newLinkToken);
        linkToken = newLinkToken;
        return;
      } catch (error) {
        if (!isClientError(error)) throw error;
      }
    }

    await refresh();
  }

  instance.interceptors.request.use((config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => ((response.config as DriverRequest).fullResponse ? response : response.data?.data),
    async (error: AxiosError) => {
      const request = error.config as DriverRequest | undefined;

      if (error.response?.status !== 401 || !request) {
        return Promise.reject(error);
      }

      if (request._retried) {
        return Promise.reject(new DriverLinkExpiredError());
      }

      request._retried = true;

      // Another request may already have refreshed the JWT; only refresh if this one used the current token.
      if (request.headers.Authorization === `Bearer ${accessToken}`) {
        await recoverSession();
      }

      return instance(request);
    }
  );

  return {
    startSession,
    get: instance.get as AxiosFunction,
    post: instance.post as AxiosDataFunction,
    delete: instance.delete as AxiosFunction,
  };
}

function createLazyAdapter(load: () => Promise<AxiosAdapter>): AxiosAdapter {
  let adapter: Promise<AxiosAdapter> | null = null;
  return async (config) => {
    adapter ??= load();
    return (await adapter)(config);
  };
}

// The import sits inside the env check so production builds drop the dev mock entirely.
export const driverBackend = createDriverBackendService({
  adapter:
    process.env.NEXT_PUBLIC_DRIVER_API_MOCK === 'true'
      ? createLazyAdapter(() =>
          import('./driverMock/driverMockAdapter').then(({ createDriverMockAdapter }) => createDriverMockAdapter())
        )
      : undefined,
});
