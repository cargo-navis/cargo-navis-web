import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it } from 'vitest';

import type { DriverShipment, DriverShipmentSummary, DriverStop } from '@/lib/api/driver.d';
import type { PaginatedResponse } from '@/lib/api/pagination.d';

import { createDriverBackendService, DriverLinkExpiredError } from '../driverBackendService';
import { createDriverMockAdapter, MOCK_DRIVER_ID } from './driverMockAdapter';

async function createService() {
  const service = createDriverBackendService({ adapter: createDriverMockAdapter({ delayMs: 0 }) });
  await service.startSession('abc');
  return service;
}

async function getPage<T>(service: Awaited<ReturnType<typeof createService>>, url: string, page: number) {
  const response = await service.get<AxiosResponse<PaginatedResponse<T>>>(url, {
    params: { page, size: 20 },
    fullResponse: true,
  });
  return response.data;
}

describe('driverMockAdapter', () => {
  it('pages stops latest first, with every upcoming stop before the completed ones', async () => {
    const service = await createService();
    const first = await getPage<DriverStop>(service, '/api/driver/stops', 1);
    const last = await getPage<DriverStop>(service, '/api/driver/stops', first.totalPages);

    expect(first).toMatchObject({ currentPage: 1, pageSize: 20, totalElements: 47, totalPages: 3 });
    expect(first.data).toHaveLength(20);
    expect(last.data).toHaveLength(7);
    // Salzburg ends the route, Rijeka's history order starts it.
    expect(first.data[0].id).toBe('stop-salzburg');
    expect(last.data.at(-1)?.id).toBe('stop-history-1-loading');

    const firstCompletedIndex = first.data.findIndex((stop) => stop.completedAt);
    expect(first.data.slice(firstCompletedIndex).every((stop) => stop.completedAt)).toBe(true);
  });

  it('pages orders latest first and opens one with only its own cargos', async () => {
    const service = await createService();
    const page = await getPage<DriverShipmentSummary>(service, '/api/driver/shipments', 1);

    expect(page).toMatchObject({ totalElements: 25, totalPages: 2 });
    expect(page.data[0]).toMatchObject({ id: 'shipment-1', completedStopsCount: 0, totalStopsCount: 3 });
    expect(page.data[0]).not.toHaveProperty('stops');

    const shipment = await service.get<DriverShipment>('/api/driver/shipments/shipment-2');
    expect(shipment.stops.map((stop) => stop.id)).toEqual(['stop-koprivnica', 'stop-zagreb']);
    const cargos = shipment.stops.flatMap((stop) => [...stop.loadingCargos, ...stop.unloadingCargos]);
    expect(cargos.every((cargo) => cargo.shipment.id === 'shipment-2')).toBe(true);
  });

  it('counts a confirmed stop in its order and returns 404 for an unknown order', async () => {
    const service = await createService();
    await service.post('/api/vehicle-stops/stop-koprivnica/complete');

    const shipment = await service.get<DriverShipment>('/api/driver/shipments/shipment-2');
    expect(shipment.completedStopsCount).toBe(1);

    const error = (await service.get('/api/driver/shipments/unknown').catch((e: AxiosError) => e)) as AxiosError;
    expect(error.response?.status).toBe(404);
  });

  it('completing a stop via /api/vehicle-stops/{id}/complete is reflected in GET /api/driver/stops', async () => {
    const service = await createService();
    const stops = await service.get<DriverStop[]>('/api/driver/stops');
    // Latest first, so the next stop is the lowest uncompleted one.
    const active = stops.findLast((stop) => !stop.completedAt)!;

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
