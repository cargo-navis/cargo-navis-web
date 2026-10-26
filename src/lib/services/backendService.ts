import axios, {
  type AxiosAdapter,
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';

import { getBackendBaseUrl } from '@/lib/utils/backendBaseUrl';
import { isServer } from '@/lib/utils/browser';
import { clearAuthCookies, getAuthTokens, setAuthTokens } from '@/lib/utils/session';

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

interface BackendServiceOptions {
  adapter?: AxiosAdapter;
  getAccessToken?(): string | undefined;
  setAccessToken?(token: string): void;
  onSessionExpired?(options: { redirect: boolean }): void;
}

function isClientError(error: unknown) {
  const status = (error as AxiosError)?.response?.status;
  return status !== undefined && status >= 400 && status < 500;
}

export function createBackendService({
  adapter,
  getAccessToken = () => (isServer ? undefined : getAuthTokens().accessToken),
  setAccessToken = (accessToken) => setAuthTokens({ accessToken }),
  onSessionExpired = ({ redirect }) => {
    clearAuthCookies();
    if (redirect) {
      // replace, not push: Back from /login should not return to the page whose session just died.
      window.location.replace('/login');
    }
  },
}: BackendServiceOptions = {}) {
  const baseURL = getBackendBaseUrl();
  const instance = axios.create({ baseURL, adapter });
  // Separate client so the refresh call never runs through the 401 handling below.
  const authClient = axios.create({ baseURL, adapter });

  // Parallel 401s share one refresh. The refresh token travels as an httpOnly cookie.
  const refresh = createSingleFlight(async () => {
    // Unlike login, refresh answers in the API envelope (see readAccessToken).
    const { data } = await authClient.post('/auth/refresh', undefined, { withCredentials: true });
    setAccessToken(readAccessToken(data));
  });

  instance.interceptors.request.use((config) => {
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

      if (error.response.status !== 401) {
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
