import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it } from 'vitest';

import type { DriverStop } from '@/lib/api/driver.d';

import { createDriverBackendService, DriverLinkExpiredError } from '../driverBackendService';
import { createDriverMockAdapter, MOCK_DRIVER_ID } from './driverMockAdapter';

async function createService() {
  const service = createDriverBackendService({ adapter: createDriverMockAdapter({ delayMs: 0 }) });
  await service.startSession('abc');
  return service;
}

describe('driverMockAdapter', () => {
  it('completing a stop via /api/vehicle-stops/{id}/complete is reflected in GET /api/driver/stops', async () => {
    const service = await createService();
    const stops = await service.get<DriverStop[]>('/api/driver/stops');
    const active = stops.find((stop) => !stop.completedAt)!;

    await service.post(`/api/vehicle-stops/${active.id}/complete`);

    const updated = await service.get<DriverStop[]>('/api/driver/stops');
    expect(updated.find((stop) => stop.id === active.id)?.completedAt).toEqual(expect.any(String));
  });

  it('deleting a document uploaded by someone else returns 403', async () => {
    const service = await createService();
    const stops = await service.get<DriverStop[]>('/api/driver/stops');
    const stop = stops.find((s) => s.documents.some((d) => d.uploadedBy !== MOCK_DRIVER_ID))!;
    const document = stop.documents.find((d) => d.uploadedBy !== MOCK_DRIVER_ID)!;

    const error = (await service
      .delete(`/api/vehicle-stops/${stop.id}/files/${document.id}`)
      .catch((e: AxiosError) => e)) as AxiosError;
    expect(error.response?.status).toBe(403);
  });

  it('exchange with token "expired" returns 410', async () => {
    const adapter = createDriverMockAdapter({ delayMs: 0 });
    const config = {
      url: '/auth/exchange',
      method: 'post',
      data: JSON.stringify({ token: 'expired' }),
      headers: {},
    } as unknown as InternalAxiosRequestConfig;

    const error = (await adapter(config).catch((e: AxiosError) => e)) as AxiosError;
    expect(error.response?.status).toBe(410);
  });

  it('startSession with token "expired" rejects with DriverLinkExpiredError', async () => {
    const service = createDriverBackendService({ adapter: createDriverMockAdapter({ delayMs: 0 }) });

    await expect(service.startSession('expired')).rejects.toBeInstanceOf(DriverLinkExpiredError);
  });
});
