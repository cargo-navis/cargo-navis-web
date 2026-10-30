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

  it('refuses to unload cargo before its loading stop is confirmed, then allows it', async () => {
    const service = await createService();

    // Osijek unloads what Zagreb loads.
    const error = await service.post('/api/vehicle-stops/stop-osijek/complete').catch((e: AxiosError) => e);
    expect((error as AxiosError<{ errorCode: string }>).response?.data.errorCode).toBe('CARGO_NOT_YET_LOADED');

    // Zagreb also unloads Koprivnica's cargo, so Koprivnica goes first.
    await service.post('/api/vehicle-stops/stop-koprivnica/complete');
    await service.post('/api/vehicle-stops/stop-zagreb/complete');
    await expect(service.post('/api/vehicle-stops/stop-osijek/complete')).resolves.toBeDefined();
  });

  it('refuses to undo a loading once its cargo is unloaded', async () => {
    const service = await createService();

    // Rijeka's cargo was already unloaded in Graz.
    const error = await service.post('/api/vehicle-stops/stop-rijeka/uncomplete').catch((e: AxiosError) => e);
    expect((error as AxiosError<{ errorCode: string }>).response?.data.errorCode).toBe(
      'CARGO_STATUS_CHANGED_BY_LATER_STOP'
    );
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

  it('refresh returns 401 before any exchange', async () => {
    const service = createDriverBackendService({ adapter: createDriverMockAdapter({ delayMs: 0 }) });

    await expect(service.startSession(null)).rejects.toBeInstanceOf(DriverLinkExpiredError);
  });

  it('refresh succeeds after an exchange', async () => {
    const adapter = createDriverMockAdapter({ delayMs: 0 });
    await createDriverBackendService({ adapter }).startSession('abc');

    // A fresh client (like a reload of /driver) restores the session from the simulated cookie.
    const service = createDriverBackendService({ adapter });
    await service.startSession(null);

    await expect(service.get<DriverStop[]>('/api/driver/stops')).resolves.toEqual(expect.any(Array));
  });
});
