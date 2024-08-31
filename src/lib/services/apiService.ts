import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

type AxiosFunction = <T>(url: string, config?: AxiosRequestConfig) => Promise<T>;
type AxiosDataFunction = <T>(url: string, data?: any, config?: AxiosRequestConfig) => Promise<T>;

function createApiService() {
  const baseURL = process.env.NEXT_PUBLIC_BACKEND_URL;

  if (!baseURL) {
    throw new Error('Missing NEXT_PUBLIC_BACKEND_URL env var.');
  }

  const instance = axios.create({
    baseURL,
  });

  instance.interceptors.response.use(
    (response) => {
      const { config, data } = response;
      const decoratedConfig = config as InternalAxiosRequestConfig & { fullResponse: boolean };

      // By doing this we'll get response.data by default, no need to destruct it in each axios call
      return decoratedConfig.fullResponse ? response : data;
    },
    async (error) => {
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

export const apiService = createApiService();
