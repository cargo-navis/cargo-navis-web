import type { VehicleStop, VehicleStopCargo, VehicleStopGroup } from '@/lib/api/vehicleStops.d';

import { at, day, serverNow } from '../../support/time';
import type { Db } from '../db';
import { fail, formField, noContent, notFound, ok, paginated, route } from '../http';
import { newId, uuid } from '../ids';
import { KORISNIK_ID, sessionUserId } from './korisnik';
import { type StoredShipment, TERET } from './nalozi';
import { POSTAL_CODES } from './ostalo';
import { VOZILO } from './vozila';
import { VOZAC } from './zaposlenici';

/**
 * Prijevozi: vehicle stops (utovari / istovari). A vehicle's route is a linked list (`previousStopId`). Stops keep
 * cargo ids only; the cargo objects are built from nalozi.ts on every read, so both sides always agree.
 */
export const STANICA = {
  /** ZG-1234-AB, Ivan: utovar of 2026/0101 in Koprivnica today. */
  podravkaUtovar: uuid(701),
  /** ZG-1234-AB, Ivan: istovar of 2026/0101 in Split tomorrow. */
  podravkaIstovar: uuid(702),
  /** ZG-5678-CD, Petra: 2026/0099 last week, both completed. */
  krasUtovar: uuid(703),
  krasIstovar: uuid(704),
};

export type StoredStop = Omit<VehicleStop, 'loadingCargos' | 'unloadingCargos'> & {
  loadingCargoIds: string[];
  unloadingCargoIds: string[];
};

function stop(fields: Partial<StoredStop> & Pick<StoredStop, 'id' | 'vehicleId'>): StoredStop {
  return {
    createdAt: at(-2, 15),
    previousStopId: null,
    address: null,
    date: null,
    driverId: null,
    trailerId: null,
    disponentId: KORISNIK_ID,
    documents: [],
    messageSentAt: null,
    loadingCargoIds: [],
    unloadingCargoIds: [],
    ...fields,
  };
}

export const stopAddress = (streetName: string, code: string) => {
  const found = POSTAL_CODES.find((entry) => entry.postalCode === code)!;
  return {
    streetName,
    postalCodeId: found.id,
    postalCode: found.postalCode,
    countryCode: found.countryCode,
    placeName: found.placeName,
  };
};

export function seedPrijevozi() {
  const stops: StoredStop[] = [
    stop({
      id: STANICA.podravkaUtovar,
      vehicleId: VOZILO.tegljac1,
      driverId: VOZAC.ivan,
      trailerId: VOZILO.prikolica1,
      address: stopAddress('Ante Starčevića 32', '48000'),
      date: day(0),
      loadingCargoIds: [TERET.podravka],
    }),
    stop({
      id: STANICA.podravkaIstovar,
      vehicleId: VOZILO.tegljac1,
      previousStopId: STANICA.podravkaUtovar,
      driverId: VOZAC.ivan,
      trailerId: VOZILO.prikolica1,
      address: stopAddress('Domovinskog rata 2', '21000'),
      date: day(1),
      unloadingCargoIds: [TERET.podravka],
    }),
    stop({
      id: STANICA.krasUtovar,
      vehicleId: VOZILO.tegljac2,
      driverId: VOZAC.petra,
      address: stopAddress('Ravnice 48', '10000'),
      date: day(-7),
      messageSentAt: at(-8, 16),
      completedAt: at(-7, 10),
      loadingCargoIds: [TERET.kras],
      createdAt: at(-9, 12),
    }),
    stop({
      id: STANICA.krasIstovar,
      vehicleId: VOZILO.tegljac2,
      previousStopId: STANICA.krasUtovar,
      driverId: VOZAC.petra,
      address: stopAddress('Industriestraße 1', '80331'),
      date: day(-6),
      messageSentAt: at(-8, 16),
      completedAt: at(-6, 15),
      unloadingCargoIds: [TERET.kras],
      createdAt: at(-9, 12),
    }),
  ];
  return { stops };
}

function cargoById(db: Db, cargoId: string): { shipment: StoredShipment; cargo: StoredShipment['cargo'][number] } {
  for (const shipment of db.nalozi) {
    const cargo = shipment.cargo.find((item) => item.id === cargoId);
    if (cargo) return { shipment, cargo };
  }
  throw new Error(`E2E data: stop points at unknown cargo ${cargoId}`);
}

function toStopCargo(db: Db, cargoId: string, position: number): VehicleStopCargo {
  const { shipment, cargo } = cargoById(db, cargoId);
  return {
    id: cargo.id,
    shipment: { id: shipment.id, orderNumber: shipment.orderNumber, clientId: shipment.clientId ?? null },
    weight: cargo.weight,
    ldm: cargo.ldm,
    description: cargo.description ?? null,
    metadata: cargo.metadata,
    position,
    loadingAddress: cargo.loadingAddress ?? null,
    loadingCompanyName: cargo.loadingCompanyName ?? null,
    loadingReadyDate: cargo.loadingReadyDate ?? null,
    loadingDescription: cargo.loadingDescription ?? null,
    loadingReference: cargo.loadingReference ?? null,
    unloadingAddress: cargo.unloadingAddress ?? null,
    unloadingCompanyName: cargo.unloadingCompanyName ?? null,
    unloadingDueDate: cargo.unloadingDueDate ?? null,
    unloadingDescription: cargo.unloadingDescription ?? null,
    unloadingReference: cargo.unloadingReference ?? null,
  };
}

/** The stop as the API returns it. */
export function toStop(db: Db, stored: StoredStop): VehicleStop {
  const { loadingCargoIds, unloadingCargoIds, ...rest } = stored;
  return {
    ...rest,
    loadingCargos: loadingCargoIds.map((id, index) => toStopCargo(db, id, index)),
    unloadingCargos: unloadingCargoIds.map((id, index) => toStopCargo(db, id, index)),
  };
}

/** One vehicle's stops in route order (following previousStopId from the stop without one). */
export function routeOf(db: Db, vehicleId: string): StoredStop[] {
  const own = db.prijevozi.stops.filter((item) => item.vehicleId === vehicleId);
  const ordered: StoredStop[] = [];
  let current = own.find((item) => !item.previousStopId || !own.some((other) => other.id === item.previousStopId));
  while (current) {
    ordered.push(current);
    const previousId: string = current.id;
    current = own.find((item) => item.previousStopId === previousId);
  }
  // Anything not reachable (broken data) still shows, at the end.
  return [...ordered, ...own.filter((item) => !ordered.includes(item))];
}

/** A vehicle's stops as the API lists them: newest (last on the route) first. */
const newestFirst = (db: Db, vehicleId: string) =>
  routeOf(db, vehicleId)
    .toReversed()
    .map((item) => toStop(db, item));

/** Stops that load or unload any cargo of this shipment. */
export function stopsOfShipment(db: Db, shipment: StoredShipment): VehicleStop[] {
  const cargoIds = new Set(shipment.cargo.map((item) => item.id));
  return db.prijevozi.stops
    .filter((item) => [...item.loadingCargoIds, ...item.unloadingCargoIds].some((id) => cargoIds.has(id)))
    .map((item) => toStop(db, item));
}

const findStop = (db: Db, id: string) => db.prijevozi.stops.find((item) => item.id === id);

/** Appends a stop at the end of its vehicle's route. */
function append(db: Db, fields: Partial<StoredStop> & Pick<StoredStop, 'vehicleId'>): StoredStop {
  const last = routeOf(db, fields.vehicleId).at(-1);
  const created = stop({ id: newId(), createdAt: serverNow(), previousStopId: last?.id ?? null, ...fields });
  db.prijevozi.stops.push(created);
  return created;
}

const addressFromRequest = (value: { streetName: string | null; postalCodeId: string } | null | undefined) => {
  if (!value) return null;
  const found = POSTAL_CODES.find((entry) => entry.id === value.postalCodeId);
  return {
    streetName: value.streetName,
    postalCodeId: value.postalCodeId,
    postalCode: found?.postalCode ?? '',
    countryCode: found?.countryCode ?? null,
    placeName: found?.placeName ?? null,
  };
};

export const prijevoziRoutes = [
  route('GET', '/api/vehicle-stops/available-cargos', (_, db) => {
    const assignedLoading = new Set(db.prijevozi.stops.flatMap((item) => item.loadingCargoIds));
    const assignedUnloading = new Set(db.prijevozi.stops.flatMap((item) => item.unloadingCargoIds));
    const all = db.nalozi.flatMap((shipment) =>
      shipment.cargo.map((cargo) => ({
        ...cargo,
        loadStatus: 'not_yet_loaded',
        shipment: { id: shipment.id, orderNumber: shipment.orderNumber, clientId: shipment.clientId ?? null },
      }))
    );
    return ok({
      loadingCargos: all.filter((cargo) => !assignedLoading.has(cargo.id)),
      unloadingCargos: all.filter((cargo) => !assignedUnloading.has(cargo.id)),
    });
  }),
  route('GET', '/api/vehicle-stops', ({ query }, db) => {
    const vehicleId = query.get('vehicleId');
    if (vehicleId) {
      return paginated(newestFirst(db, vehicleId), query);
    }
    // groupBy=vehicle: every vehicle with stops, newest first, optionally only the newest n.
    const limit = Number(query.get('limitPerVehicle') ?? 0);
    const vehicleIds = [...new Set(db.prijevozi.stops.map((item) => item.vehicleId))];
    const groups: VehicleStopGroup[] = vehicleIds.map((id) => {
      const stops = newestFirst(db, id);
      return { vehicleId: id, stops: limit ? stops.slice(0, limit) : stops };
    });
    return ok(groups);
  }),
  route('POST', '/api/vehicle-stops/assign-shipment', ({ body }, db) => {
    const shipment = db.nalozi.find((item) => item.id === body.shipmentId);
    if (!shipment) return notFound('Shipment');
    const created: StoredStop[] = [];
    for (const { cargoId, loadingDate, unloadingDate } of body.cargoStopDates ?? []) {
      const { cargo } = cargoById(db, cargoId);
      // Like the backend: new stops inherit the vehicle's latest driver and trailer unless the request names a driver.
      const latest = routeOf(db, body.vehicleId).at(-1);
      const common = {
        vehicleId: body.vehicleId,
        driverId: body.driverId ?? latest?.driverId ?? null,
        trailerId: latest?.trailerId ?? null,
      };
      created.push(
        append(db, { ...common, address: cargo.loadingAddress, date: loadingDate, loadingCargoIds: [cargoId] }),
        append(db, { ...common, address: cargo.unloadingAddress, date: unloadingDate, unloadingCargoIds: [cargoId] })
      );
    }
    return ok(
      created.map((item) => toStop(db, item)),
      201
    );
  }),
  route('POST', '/api/vehicle-stops', ({ body }, db) => {
    const created = (body as any[]).map(
      ({ address, loadingCargoIds = [], unloadingCargoIds = [], sendMessage, ...rest }) =>
        append(db, {
          ...rest,
          address: addressFromRequest(address),
          loadingCargoIds,
          unloadingCargoIds,
          messageSentAt: sendMessage ? serverNow() : null,
        })
    );
    return ok(
      created.map((item) => toStop(db, item)),
      201
    );
  }),
  route('GET', '/api/vehicle-stops/:id', ({ params }, db) => {
    const found = findStop(db, params.id);
    return found ? ok(toStop(db, found)) : notFound('Vehicle stop');
  }),
  route('PATCH', '/api/vehicle-stops/:id', ({ params, body }, db) => {
    const found = findStop(db, params.id);
    if (!found) return notFound('Vehicle stop');
    const { address, ...rest } = body ?? {};
    Object.assign(found, rest);
    if (address !== undefined) found.address = addressFromRequest(address);
    return ok(toStop(db, found));
  }),
  // Moves the stop after `previousStopId` (null = first) and closes the gap it left.
  route('PATCH', '/api/vehicle-stops/:id/rearrange', ({ params, body }, db) => {
    const moved = findStop(db, params.id);
    if (!moved) return notFound('Vehicle stop');
    const order = routeOf(db, moved.vehicleId).filter((item) => item.id !== moved.id);
    const index = body.previousStopId ? order.findIndex((item) => item.id === body.previousStopId) + 1 : 0;
    order.splice(index, 0, moved);
    order.forEach((item, position) => (item.previousStopId = position === 0 ? null : order[position - 1].id));
    return ok(toStop(db, moved));
  }),
  route('DELETE', '/api/vehicle-stops/:id', ({ params }, db) => {
    const found = findStop(db, params.id);
    if (!found) return notFound('Vehicle stop');
    const next = db.prijevozi.stops.find((item) => item.previousStopId === found.id);
    if (next) next.previousStopId = found.previousStopId;
    db.prijevozi.stops.splice(db.prijevozi.stops.indexOf(found), 1);
    return noContent();
  }),
  // Stop documents (CMR, photos): the driver portal and the dashboard both upload here. `filename` comes in the query.
  route('POST', '/api/vehicle-stops/:id/files', (request, db) => {
    const found = findStop(db, request.params.id);
    if (!found) return notFound('Vehicle stop');
    const name = request.query.get('filename') ?? formField(request, 'file') ?? 'dokument.pdf';
    const document = {
      id: newId(),
      createdAt: serverNow(),
      name,
      mimeType: name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
      status: 'UPLOADED',
      publicUrl: null,
      uploadedBy: sessionUserId(request.headers) ?? null,
    };
    found.documents = [...found.documents, document];
    return ok(document, 201);
  }),
  route('GET', '/api/vehicle-stops/:id/files/:documentId', ({ params }) =>
    ok(`http://localhost/e2e-files/vehicle-stops/${params.id}/${params.documentId}`)
  ),
  route('DELETE', '/api/vehicle-stops/:id/files/:documentId', ({ params }, db) => {
    const found = findStop(db, params.id);
    if (!found) return notFound('Vehicle stop');
    found.documents = found.documents.filter((document) => document.id !== params.documentId);
    return noContent();
  }),
  route('POST', '/api/vehicle-stops/:id/notify-driver', ({ params }, db) => {
    const found = findStop(db, params.id);
    if (!found) return notFound('Vehicle stop');
    if (!found.driverId) return fail(422, 'No driver', 'VEHICLE_STOP_NO_DRIVER');
    found.messageSentAt = serverNow();
    return ok(toStop(db, found));
  }),
  route('POST', '/api/vehicle-stops/:id/complete', ({ params }, db) => {
    const found = findStop(db, params.id);
    if (!found) return notFound('Vehicle stop');
    found.completedAt = serverNow();
    return ok(toStop(db, found));
  }),
  route('POST', '/api/vehicle-stops/:id/uncomplete', ({ params }, db) => {
    const found = findStop(db, params.id);
    if (!found) return notFound('Vehicle stop');
    delete found.completedAt;
    return ok(toStop(db, found));
  }),
  route('POST', '/api/shipments/:id/notify-drivers', ({ params }, db) => {
    const shipment = db.nalozi.find((item) => item.id === params.id);
    if (!shipment) return notFound('Shipment');
    const cargoIds = new Set(shipment.cargo.map((item) => item.id));
    const stops = db.prijevozi.stops.filter(
      (item) => item.driverId && [...item.loadingCargoIds, ...item.unloadingCargoIds].some((id) => cargoIds.has(id))
    );
    const now = serverNow();
    stops.forEach((item) => (item.messageSentAt = now));
    return ok(stops.map((item) => toStop(db, item)));
  }),
];

/**
 * Inserts a stop into a vehicle's route right after `afterId` (null = first) and relinks the stop that followed it.
 * For tests that need a particular route shape (same-day stops, undated stops).
 */
export function insertStop(
  db: Db,
  fields: Partial<StoredStop> & Pick<StoredStop, 'id' | 'vehicleId'>,
  afterId: string | null
): StoredStop {
  const created = stop({ ...fields, previousStopId: afterId });
  const next = db.prijevozi.stops.find(
    (item) => item.vehicleId === fields.vehicleId && item.previousStopId === afterId
  );
  if (next) next.previousStopId = created.id;
  db.prijevozi.stops.push(created);
  return created;
}
