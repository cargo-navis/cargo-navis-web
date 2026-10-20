import axios, {
  type AxiosAdapter,
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';

import type { DriverTokenExchangeResponse } from '@/lib/api/driver.d';

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
 * API client for the driver portal. Kept apart from the dispatcher `backend` client: the driver JWT
 * lives only in memory, comes from exchanging the WhatsApp link token, and a 401 never redirects to /login.
 */
export function createDriverBackendService({ adapter }: { adapter?: AxiosAdapter } = {}) {
  const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';
  const exchangeClient = axios.create({ baseURL, adapter });
  const instance = axios.create({ baseURL, adapter });

  let linkToken: string | null = null;
  let accessToken: string | null = null;
  let pendingExchange: Promise<void> | null = null;

  // Parallel callers share one in-flight exchange.
  function exchange() {
    if (!pendingExchange) {
      pendingExchange = exchangeClient
        .post<DriverTokenExchangeResponse>('/auth/exchange', { token: linkToken })
        .then(({ data }) => {
          accessToken = data.accessToken;
        })
        .catch((error) => {
          throw isClientError(error) ? new DriverLinkExpiredError() : error;
        })
        .finally(() => {
          pendingExchange = null;
        });
    }

    return pendingExchange;
  }

  function startSession(token: string) {
    linkToken = token;
    accessToken = null;
    return exchange();
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

      // Another request may already have refreshed the JWT; only exchange if this one used the current token.
      if (request.headers.Authorization === `Bearer ${accessToken}`) {
        await exchange();
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
