import { describe, expect, it } from 'vitest';

import type { Vehicle } from '@/lib/api';
import type { VehicleStop } from '@/lib/api/vehicleStops';

import { buildRoutes, matchesSearch, routeHref, type VehicleRoute } from './routes';

const stop = (id: string, driverId: string | null): VehicleStop => ({
  id,
  createdAt: '',
  vehicleId: 'v1',
  previousStopId: null,
  address: null,
  date: null,
  driverId,
  trailerId: null,
  disponentId: null,
  loadingCargos: [],
  unloadingCargos: [],
  documents: [],
  messageSentAt: null,
});

const vehicle = (id: string, registration: string, brand: string) => ({ id, registration, brand }) as Vehicle;

describe('routeHref', () => {
  it('links the Ruta page, optionally highlighting a stop', () => {
    expect(routeHref('v1')).toBe('/dashboard/vehicle-stops/v1');
    expect(routeHref('v1', 's 1/2')).toBe('/dashboard/vehicle-stops/v1?highlight=s%201%2F2');
  });
});

describe('buildRoutes', () => {
  it('joins groups with their vehicles', () => {
    const stops = [stop('a', 'd1')];
    const vehicles = new Map([['v1', vehicle('v1', 'KC 123-AB', 'Volvo')]]);
    const [known, unknown] = buildRoutes(
      [
        { vehicleId: 'v1', stops },
        { vehicleId: 'v9', stops: [] },
      ],
      vehicles
    );
    expect(known).toMatchObject({ vehicleId: 'v1', registration: 'KC 123-AB', brand: 'Volvo', stops });
    expect(known.facts.next?.id).toBe('a');
    expect(unknown).toMatchObject({ vehicleId: 'v9', registration: '—', brand: '', stops: [] });
  });
});

describe('matchesSearch', () => {
  const names: Record<string, string> = { d1: 'Ivan Horvat', d2: 'Željko Čačić' };
  const driverName = (id: string) => names[id];
  const [route] = buildRoutes(
    [{ vehicleId: 'v1', stops: [stop('a', 'd1'), stop('b', 'd2'), stop('c', null), stop('d', 'gone')] }],
    new Map([['v1', vehicle('v1', 'KC 123-AB', 'Volvo')]])
  ) as [VehicleRoute];

  it.each(['', '   ', 'kc 123', 'KC123AB', 'kc-123-ab', 'kc123-ab', 'horvat', 'zeljko', 'ČAČIĆ', 'cacic'])(
    'finds „%s”',
    (query) => expect(matchesSearch(route, query, driverName)).toBe(true)
  );

  it.each(['volvo', 'ZG', 'marko'])('misses „%s”', (query) =>
    expect(matchesSearch(route, query, driverName)).toBe(false)
  );
});
