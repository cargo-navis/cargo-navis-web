import { type AxiosAdapter, AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import dayjs from 'dayjs';

import { createMockStops, MOCK_DRIVER_ID, mockAccount } from './driverMockData';

export { MOCK_DRIVER_ID };

const MOCK_FILE_URL = '/apple-touch-icon.png';

/**
 * Dev-only fake of the driver portal backend (run `npm run dev:driverMock`, which sets NEXT_PUBLIC_DRIVER_API_MOCK=true).
 * Keeps state in memory, so confirmations and uploads survive until a page reload.
 */
export function createDriverMockAdapter({ delayMs = 400 }: { delayMs?: number } = {}): AxiosAdapter {
  const stops = createMockStops();
  let documentCounter = 0;

  function respond(config: InternalAxiosRequestConfig, status: number, data?: unknown): AxiosResponse {
    const response: AxiosResponse = { data, status, statusText: '', headers: {}, config };
    if (status >= 400) {
      throw new AxiosError(`Request failed with status code ${status}`, String(status), config, null, response);
    }
    return response;
  }

  function findStop(id: string) {
    return stops.find((stop) => stop.id === id);
  }

  function handle(config: InternalAxiosRequestConfig): AxiosResponse {
    const method = (config.method ?? 'get').toLowerCase();
    const url = config.url ?? '';
    let match: RegExpMatchArray | null;

    if (method === 'post' && url === '/auth/exchange') {
      const { token } = JSON.parse(config.data ?? '{}');
      return token === 'expired' ? respond(config, 410) : respond(config, 200, { accessToken: 'mock-jwt' });
    }

    if (method === 'get' && url === '/api/account') {
      return respond(config, 200, { data: mockAccount });
    }

    if (method === 'get' && url === '/api/driver/stops') {
      const days = Number(config.params?.completedWithinDays ?? 7);
      const since = dayjs().subtract(days, 'day');
      const visible = stops.filter((stop) => !stop.completedAt || dayjs(stop.completedAt).isAfter(since));
      return respond(config, 200, { data: visible });
    }

    if (method === 'post' && (match = url.match(/^\/api\/vehicle-stops\/([^/]+)\/(complete|uncomplete)$/))) {
      const stop = findStop(match[1]);
      if (!stop) return respond(config, 404);
      stop.completedAt = match[2] === 'complete' ? new Date().toISOString() : null;
      return respond(config, 200, { data: stop });
    }

    if (method === 'post' && (match = url.match(/^\/api\/vehicle-stops\/([^/]+)\/files$/))) {
      const stop = findStop(match[1]);
      if (!stop) return respond(config, 404);
      const file = (config.data as FormData).get('file') as File;
      documentCounter += 1;
      const document = {
        id: `mock-upload-${documentCounter}`,
        createdAt: new Date().toISOString(),
        name: config.params?.filename ?? file.name,
        mimeType: file.type,
        status: 'uploaded',
        publicUrl: null,
        uploadedBy: MOCK_DRIVER_ID,
      };
      stop.documents.push(document);
      return respond(config, 200, { data: document });
    }

    if ((match = url.match(/^\/api\/vehicle-stops\/([^/]+)\/files\/([^/]+)$/))) {
      const stop = findStop(match[1]);
      const document = stop?.documents.find((doc) => doc.id === match![2]);
      if (!stop || !document) return respond(config, 404);

      if (method === 'get') return respond(config, 200, { data: MOCK_FILE_URL });

      if (method === 'delete') {
        if (document.uploadedBy !== MOCK_DRIVER_ID) return respond(config, 403);
        stop.documents = stop.documents.filter((doc) => doc.id !== document.id);
        return respond(config, 200, { data: null });
      }
    }

    return respond(config, 404);
  }

  return async (config) => {
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }

    const response = handle(config);
    // Hand out copies so React Query never holds references the adapter mutates later.
    return { ...response, data: structuredClone(response.data) };
  };
}
