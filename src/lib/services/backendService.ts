import axios, {
  type AxiosAdapter,
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';

import { getBackendBaseUrl } from '@/lib/utils/backendBaseUrl';
import { isServer } from '@/lib/utils/browser';

import { isAccessTokenExpiring } from './accessTokenExpiry';
import { accessTokenStore } from './accessTokenStore';
import { withCrossTabLock } from './crossTabLock';
import { readAccessToken } from './readAccessToken';
import { createSingleFlight } from './singleFlight';

type AxiosFunction = <T>(url: string, config?: AxiosRequestConfig & { fullResponse?: boolean }) => Promise<T>;
type AxiosDataFunction = <T>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig & { fullResponse?: boolean }
) => Promise<T>;

type OriginalRequest = InternalAxiosRequestConfig & {
  _doNotRefresh?: boolean;
  _ignoreRedirect?: boolean;
  _retried?: boolean;
};

const REFRESH_URL = '/auth/refresh';
const REFRESH_LOCK = 'cargo-navis-auth-refresh';

interface BackendServiceOptions {
  adapter?: AxiosAdapter;
  getAccessToken?(): string | undefined;
  setAccessToken?(token: string): void;
  onSessionExpired?(options: { redirect: boolean }): void;
  // Refresh a missing or expiring token before sending. Off on the server, which has no refresh cookie to send.
  refreshBeforeSend?: boolean;
  // Runs the refresh call so that only one tab refreshes at a time (see the refresh below)
  withRefreshLock?<T>(run: () => Promise<T>): Promise<T>;
}

function isClientError(error: unknown) {
  const status = (error as AxiosError)?.response?.status;
  return status !== undefined && status >= 400 && status < 500;
}

export function createBackendService({
  adapter,
  getAccessToken = accessTokenStore.get,
  setAccessToken = accessTokenStore.set,
  onSessionExpired = ({ redirect }) => {
    accessTokenStore.clear();
    if (redirect) {
      // replace, not push: Back from /login should not return to the page whose session just died.
      window.location.replace('/login');
    }
  },
  refreshBeforeSend = !isServer,
  withRefreshLock = (run) => withCrossTabLock(REFRESH_LOCK, run),
}: BackendServiceOptions = {}) {
  const baseURL = getBackendBaseUrl();
  const instance = axios.create({ baseURL, adapter });
  // Separate client so the refresh call never runs through the 401 handling below.
  const authClient = axios.create({ baseURL, adapter });

  // Parallel requests share one refresh. The refresh token travels as an httpOnly cookie.
  // Tabs take turns: each refresh replaces the refresh cookie, and the backend treats a replaced cookie sent again as
  // stolen and signs the account out everywhere. Waiting for the other tab means this one sends the new cookie.
  const refresh = createSingleFlight(() =>
    withRefreshLock(async () => {
      // Unlike login, refresh answers in the API envelope (see readAccessToken).
      const { data } = await authClient.post(REFRESH_URL, undefined, { withCredentials: true });
      setAccessToken(readAccessToken(data));
    })
  );

  // Before sending, so requests don't go out only to come back 401:
  // - a refresh is already running (another request got a 401): wait for it;
  // - the token is missing or about to expire: refresh first; parallel requests share that one refresh.
  // The 401 handling below still covers tokens rejected for other reasons (revoked, unreadable).
  instance.interceptors.request.use(async (config) => {
    const request = config as OriginalRequest;
    await refresh.inFlight()?.catch(() => undefined);

    const token = getAccessToken();
    if (refreshBeforeSend && !request._doNotRefresh && (!token || isAccessTokenExpiring(token))) {
      try {
        await refresh();
      } catch (refreshError) {
        // The refresh cookie is gone or rejected: the session is over, so don't send the request at all.
        if (isClientError(refreshError)) {
          onSessionExpired({ redirect: !request._ignoreRedirect });
          throw refreshError;
        }
        // A network error or 5xx says nothing about the session; send the request and let the 401 handling retry.
      }
    }

    const accessToken = getAccessToken();

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      const { config, data } = response;
      const decoratedConfig = config as InternalAxiosRequestConfig & { fullResponse: boolean };

      // By doing this we'll get response.data by default, no need to destruct it in each axios call
      return decoratedConfig.fullResponse ? response : data?.data;
    },
    async (error) => {
      if (!error.response && error.request) {
        // The request was made but no response was received
        console.log(error.request);
        return Promise.reject(error);
      }

      if (!error.response && !error.request) {
        // Something happened in setting up the request that triggered an Error
        // reportSentryError(error, error.message);
        return Promise.reject(error);
      }

      // A failed refresh from the check before sending arrives here too; it is not an API 401 to retry.
      if (error.response.status !== 401 || error.config?.url === REFRESH_URL) {
        return Promise.reject(error);
      }

      // Get original request, so we can retry it after refreshing our tokens
      const originalRequest: OriginalRequest = error.config;
      const expireSession = () => onSessionExpired({ redirect: !originalRequest._ignoreRedirect });

      if (originalRequest._doNotRefresh) {
        return Promise.reject(error);
      }

      if (originalRequest._retried) {
        expireSession();
        return Promise.reject(error);
      }

      originalRequest._retried = true;

      // Another request may already have refreshed the token; only refresh if this one used the current token.
      const currentToken = getAccessToken();
      if (!currentToken || originalRequest.headers.Authorization === `Bearer ${currentToken}`) {
        try {
          await refresh();
        } catch (refreshError) {
          // A network error or 5xx is not a verdict on the session, so keep the user signed in.
          if (isClientError(refreshError)) {
            expireSession();
          }
          return Promise.reject(error);
        }
      }

      return instance(originalRequest);
    }
  );

  return {
    get: instance.get as AxiosFunction,
    post: instance.post as AxiosDataFunction,
    put: instance.put as AxiosDataFunction,
    patch: instance.patch as AxiosDataFunction,
    delete: instance.delete as AxiosFunction,
  };
}

export const backend = createBackendService();
