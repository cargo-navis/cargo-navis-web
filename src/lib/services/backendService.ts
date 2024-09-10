import { decorateRequest } from '@/lib/utils/auth';
import { clearAuthCookies } from '@/lib/utils/session';
import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';

// import { AuthResponse } from '~/apis';

type AxiosFunction = <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
type AxiosDataFunction = <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;

type OriginalRequest = InternalAxiosRequestConfig & { _doNotRefresh: boolean; _ignoreRedirect: boolean };

function createBackendService() {
	const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;

	if (!baseURL) {
		throw new Error('Missing NEXT_PUBLIC_BACKEND_URL env var.');
	}

	const instance = axios.create({
		baseURL,
	});

	// let isRefreshing = false;
	// let failedRequestsQueue: any[] = [];

	// TODO - add token refreshment logic after BE implements designated endpoint
	// function processFailedRequestsQueue(err: unknown) {
	//   failedRequestsQueue.forEach((promise) => (err ? promise.reject(err) : promise.resolve()));
	//   failedRequestsQueue = [];
	// }

	instance.interceptors.request.use(decorateRequest);
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

			// Get original request so we can retry it after refreshing our tokens
			const originalRequest: OriginalRequest = error.config;

			if (originalRequest._doNotRefresh) {
				return Promise.reject(error);
			}

			// Store other parallel API requests (all except for the first one) into a queue
			// and resolve them after token refresh
			// TODO - add token refreshment logic after BE implements designated endpoint
			// if (isRefreshing) {
			//   return new Promise((resolve, reject) => failedRequestsQueue.push({ resolve, reject }))
			//     .then(() => instance(originalRequest))
			//     .catch((err) => Promise.reject(err));
			// }

			// TODO - add token refreshment logic after BE implements designated endpoint
			// isRefreshing = true;
			// // First attempt to refresh the token
			// try {
			//   const { data: authResponse } = await refreshAccessTokens();
			//   setAuthTokens(authResponse.authTokens);
			//
			//   isRefreshing = false;
			//   processFailedRequestsQueue(null);
			//
			//   return instance(originalRequest);
			// } catch (e) {
			//   clearAuthCookies();
			//
			//   isRefreshing = false;
			//   processFailedRequestsQueue(e);
			//
			//   if (!originalRequest._ignoreRedirect) {
			//     window.location.pathname = '/login';
			//   }
			//
			//   return Promise.reject(error);
			// }

			clearAuthCookies();
			return Promise.reject(error);
		},
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

// async function refreshAccessTokens() {
//   const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;
//
//   const instance = axios.create({ baseURL });
//   const refreshToken = getAuthTokens()?.refreshToken;
//
//   return instance.post<AuthResponse.RootObject>('/v1/auth/refresh-token', { refreshToken });
// }
