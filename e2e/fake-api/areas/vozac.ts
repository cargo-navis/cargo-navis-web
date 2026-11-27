import type {
  DriverCargoLoadStatus,
  DriverShipment,
  DriverShipmentSummary,
  DriverStop,
  DriverStopCargo,
} from '@/lib/api/driver.d';
import type { VehicleStop } from '@/lib/api/vehicleStops.d';

import type { Db } from '../db';
import { fail, notFound, ok, paginated, route } from '../http';
import { accessToken, REFRESH_COOKIE, sessionUserId } from './korisnik';
import { routeOf, type StoredStop, toStop } from './prijevozi';
import { VOZAC } from './zaposlenici';

/**
 * Driver portal (/driver). A driver opens a link `/driver/<token>`; POST /auth/exchange swaps it for a session (an
 * access token and the httpOnly refresh cookie `driver:<id>`, see korisnik.ts). Ivan's link is DRIVER_LINK; any other
 * token is expired (410). Stops and nalozi are this driver's, newest first, paged like the real endpoints, and built
 * from prijevozi.ts / nalozi.ts so confirming in the portal shows up on the dashboard and back.
 */
export const DRIVER_LINK = { token: 'e2e-driver-link', driverId: VOZAC.ivan };

/** The driver whose session the request carries. */
const driverOf = (headers: Record<string, string>) => sessionUserId(headers);

function loadStatus(db: Db, cargoId: string): DriverCargoLoadStatus {
  const stops = db.prijevozi.stops.filter((stop) => stop.completedAt);
  if (stops.some((stop) => stop.unloadingCargoIds.includes(cargoId))) return 'unloaded';
  if (stops.some((stop) => stop.loadingCargoIds.includes(cargoId))) return 'loaded';
  return 'not_yet_loaded';
}

function toDriverStop(db: Db, stored: StoredStop, onlyShipmentId?: string): DriverStop {
  const stop: VehicleStop = toStop(db, stored);
  const clientName = (shipmentId: string) => {
    const shipment = db.nalozi.find((item) => item.id === shipmentId);
    return db.partneri.clients.find((client) => client.id === shipment?.clientId)?.name ?? null;
  };
  const cargos = (list: VehicleStop['loadingCargos']): DriverStopCargo[] =>
    list
      .filter((cargo) => !onlyShipmentId || cargo.shipment.id === onlyShipmentId)
      .map((cargo) => ({
        ...cargo,
        shipment: {
          id: cargo.shipment.id,
          orderNumber: cargo.shipment.orderNumber,
          clientName: clientName(cargo.shipment.id),
        },
        loadStatus: loadStatus(db, cargo.id),
      }));
  const disponent = db.zaposlenici.find((employee) => employee.id === stop.disponentId);
  return {
    id: stop.id,
    address: stop.address,
    date: stop.date,
    completedAt: stop.completedAt ?? null,
    loadingCargos: cargos(stop.loadingCargos),
    unloadingCargos: cargos(stop.unloadingCargos),
    documents: stop.documents,
    disponent: disponent
      ? { firstName: disponent.firstName, lastName: disponent.lastName, phoneNumber: disponent.phoneNumber }
      : null,
  };
}

/** The driver's stops, newest (last on the route) first, across their vehicles. */
function driverStops(db: Db, driverId: string): StoredStop[] {
  const vehicleIds = [
    ...new Set(db.prijevozi.stops.filter((stop) => stop.driverId === driverId).map((s) => s.vehicleId)),
  ];
  return vehicleIds.flatMap((vehicleId) =>
    routeOf(db, vehicleId)
      .filter((stop) => stop.driverId === driverId)
      .toReversed()
  );
}

function shipmentsOf(db: Db, driverId: string) {
  const stops = driverStops(db, driverId);
  const ids = new Set(
    stops
      .flatMap((stop) => toStop(db, stop).loadingCargos.concat(toStop(db, stop).unloadingCargos))
      .map((c) => c.shipment.id)
  );
  return db.nalozi
    .filter((shipment) => ids.has(shipment.id))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map((shipment) => {
      const own = stops
        .filter((stop) =>
          [...stop.loadingCargoIds, ...stop.unloadingCargoIds].some((id) => shipment.cargo.some((c) => c.id === id))
        )
        .toReversed();
      const summary: DriverShipmentSummary = {
        id: shipment.id,
        orderNumber: shipment.orderNumber,
        clientName: db.partneri.clients.find((client) => client.id === shipment.clientId)?.name ?? null,
        origin: own.find((stop) => stop.loadingCargoIds.length)?.address ?? null,
        destination: own.findLast((stop) => stop.unloadingCargoIds.length)?.address ?? null,
        completedStopsCount: own.filter((stop) => stop.completedAt).length,
        totalStopsCount: own.length,
      };
      return { summary, stops: own };
    });
}

export const vozacRoutes = [
  route('POST', '/auth/exchange', ({ body }) => {
    if (body?.token !== DRIVER_LINK.token) return fail(410, 'Link expired', 'LINK_EXPIRED');
    return {
      status: 200,
      body: { data: { accessToken: accessToken(DRIVER_LINK.driverId) }, status: 'success' },
      headers: { 'set-cookie': `${REFRESH_COOKIE}=driver:${DRIVER_LINK.driverId}; Path=/; HttpOnly; SameSite=Lax` },
    };
  }),
  route('GET', '/api/driver/stops', ({ headers, query }, db) => {
    const driverId = driverOf(headers);
    if (!driverId) return fail(401, 'No session', 'UNAUTHORIZED');
    return paginated(
      driverStops(db, driverId).map((stop) => toDriverStop(db, stop)),
      query
    );
  }),
  route('GET', '/api/driver/shipments', ({ headers, query }, db) => {
    const driverId = driverOf(headers);
    if (!driverId) return fail(401, 'No session', 'UNAUTHORIZED');
    return paginated(
      shipmentsOf(db, driverId).map(({ summary }) => summary),
      query
    );
  }),
  route('GET', '/api/driver/shipments/:id', ({ headers, params }, db) => {
    const driverId = driverOf(headers);
    if (!driverId) return fail(401, 'No session', 'UNAUTHORIZED');
    const found = shipmentsOf(db, driverId).find(({ summary }) => summary.id === params.id);
    if (!found) return notFound('Shipment');
    const shipment: DriverShipment = {
      ...found.summary,
      stops: found.stops.map((stop) => toDriverStop(db, stop, params.id)),
    };
    return ok(shipment);
  }),
];
