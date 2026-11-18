import type { Vehicle } from '@/lib/api';
import type { VehicleStop, VehicleStopGroup } from '@/lib/api/vehicleStops';

import { type RouteFacts, routeFacts } from './routeFacts';

/** One vehicle in the Prijevozi list. `stops` = the API's order (newest first). */
export interface VehicleRoute {
  vehicleId: string;
  registration: string;
  brand: string;
  stops: VehicleStop[];
  facts: RouteFacts;
}

/** The vehicle's Ruta page; `stopId` scrolls to that stop and highlights it. */
export function routeHref(vehicleId: string, stopId?: string) {
  return `/dashboard/vehicle-stops/${vehicleId}${stopId ? `?highlight=${encodeURIComponent(stopId)}` : ''}`;
}

export function buildRoutes(groups: VehicleStopGroup[], vehicles: Map<string, Vehicle>): VehicleRoute[] {
  return groups.map((group) => {
    const vehicle = vehicles.get(group.vehicleId);
    return {
      vehicleId: group.vehicleId,
      registration: vehicle?.registration ?? '—',
      brand: vehicle?.brand ?? '',
      stops: group.stops,
      facts: routeFacts(group.stops),
    };
  });
}

const fold = (value: string) => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

/** Search by registration (with or without spaces / dashes) or any driver on the route (lab /transports). */
export function matchesSearch(route: VehicleRoute, query: string, driverName: (id: string) => string | undefined) {
  const term = fold(query.trim());
  if (!term) return true;
  const drivers = Array.from(new Set(route.stops.map((stop) => stop.driverId).filter((id): id is string => !!id)))
    .map((id) => driverName(id) ?? '')
    .join(' ');
  const haystack = fold(`${route.registration} ${route.registration.replace(/[\s-]/g, '')} ${drivers}`);
  return haystack.includes(term) || haystack.includes(term.replace(/[\s-]/g, ''));
}
