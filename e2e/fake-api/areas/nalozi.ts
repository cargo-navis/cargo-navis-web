import type { Cargo, Shipment } from '@/lib/api/shipments.d';

import { at, day, serverNow } from '../../support/time';
import type { Db } from '../db';
import { noContent, notFound, ok, paginated, route } from '../http';
import { newId, uuid } from '../ids';
import { KORISNIK_ID } from './korisnik';
import { POSTAL_CODES, postalCode } from './ostalo';
import { KLIJENT } from './partneri';
import { stopsOfShipment } from './prijevozi';

/**
 * Nalozi (shipments) and their tereti (cargo). A cargo's loadStatus is not stored: it follows from the stops of
 * prijevozi.ts (completed utovar = loaded, completed istovar = unloaded), like on the backend.
 */
export const NALOG = {
  /** On ZG-1234-AB with Ivan: utovar today in Koprivnica, istovar tomorrow in Split. Driver not notified yet. */
  podravka: uuid(501),
  /** No vehicle yet: utovar tomorrow in Zagreb, istovar the day after in Ljubljana. */
  atlantic: uuid(502),
  /** Delivered last week, invoice sent. */
  kras: uuid(503),
};

export const TERET = {
  podravka: uuid(601),
  atlantic: uuid(602),
  kras: uuid(603),
};

type StoredCargo = Omit<Cargo, 'loadStatus'>;
export type StoredShipment = Omit<Shipment, 'cargo' | 'vehicleStops'> & { cargo: StoredCargo[] };

const address = (streetName: string, code: string) => {
  const { id, ...rest } = postalCode(code);
  return { streetName, postalCodeId: id, ...rest };
};

const metadata = (palleteAmount: number) => ({
  type: 'pallet',
  palleteType: 'EUR',
  palleteAmount,
  width: 0,
  height: 0,
  length: 0,
});

function shipment(
  fields: Partial<StoredShipment> & Pick<StoredShipment, 'id' | 'orderNumber' | 'cargo'>
): StoredShipment {
  return {
    createdById: KORISNIK_ID,
    invoiceStatus: 'not_sent' as Shipment['invoiceStatus'],
    invoiceStatusUpdatedAt: null,
    isInvoiceOverdue: false,
    price: 1000,
    createdAt: at(-1, 10),
    documents: [],
    notificationEmails: [],
    isAgency: false,
    childId: null,
    contractorOrderNumber: null,
    contractorExternalOrderReference: null,
    contractorPrice: null,
    contractorInvoiceStatus: null,
    ...fields,
  };
}

export function seedNalozi(): StoredShipment[] {
  return [
    shipment({
      id: NALOG.podravka,
      orderNumber: '2026/0101',
      externalOrderReference: 'POD-4471',
      clientId: KLIJENT.podravka,
      price: 1450,
      createdAt: at(-2, 14),
      cargo: [
        {
          id: TERET.podravka,
          weight: 12_000,
          ldm: 6.8,
          description: 'Juhe i začini',
          metadata: metadata(17),
          loadingAddress: address('Ante Starčevića 32', '48000'),
          loadingCompanyName: 'Podravka d.d.',
          loadingReadyDate: day(0),
          loadingReference: 'UT-1',
          unloadingAddress: address('Domovinskog rata 2', '21000'),
          unloadingCompanyName: 'Konzum Split',
          unloadingDueDate: day(1),
          unloadingReference: 'IS-1',
        },
      ],
    }),
    shipment({
      id: NALOG.atlantic,
      orderNumber: '2026/0102',
      externalOrderReference: 'ATL-9002',
      clientId: KLIJENT.atlantic,
      price: 980,
      createdAt: at(-1, 9),
      cargo: [
        {
          id: TERET.atlantic,
          weight: 8_000,
          ldm: 4.2,
          description: 'Napitci',
          metadata: metadata(11),
          loadingAddress: address('Miramarska 23', '10000'),
          loadingCompanyName: 'Atlantic Grupa d.d.',
          loadingReadyDate: day(1),
          unloadingAddress: address('Letališka 3', '1000'),
          unloadingCompanyName: 'Mercator d.d.',
          unloadingDueDate: day(2),
        },
      ],
    }),
    shipment({
      id: NALOG.kras,
      orderNumber: '2026/0099',
      externalOrderReference: 'KR-118',
      clientId: KLIJENT.kras,
      price: 1200,
      invoiceStatus: 'sent' as Shipment['invoiceStatus'],
      invoiceStatusUpdatedAt: at(-5, 12),
      createdAt: at(-9, 11),
      cargo: [
        {
          id: TERET.kras,
          weight: 5_000,
          ldm: 3,
          description: 'Slatkiši',
          metadata: metadata(8),
          loadingAddress: address('Ravnice 48', '10000'),
          loadingCompanyName: 'Kraš d.d.',
          loadingReadyDate: day(-7),
          unloadingAddress: address('Industriestraße 1', '80331'),
          unloadingCompanyName: 'Rewe München',
          unloadingDueDate: day(-6),
        },
      ],
    }),
  ];
}

/** The shipment as the API returns it: cargo with its loadStatus, and its vehicle stops. */
export function toShipment(db: Db, stored: StoredShipment): Shipment {
  const stops = stopsOfShipment(db, stored);
  const cargo: Cargo[] = stored.cargo.map((item) => {
    const unloaded = stops.some((stop) => stop.completedAt && stop.unloadingCargos.some((c) => c.id === item.id));
    const loaded = stops.some((stop) => stop.completedAt && stop.loadingCargos.some((c) => c.id === item.id));
    return {
      ...item,
      loadStatus: (unloaded ? 'unloaded' : loaded ? 'loaded' : 'not_yet_loaded') as Cargo['loadStatus'],
    } as Cargo;
  });
  return { ...stored, cargo, vehicleStops: stops };
}

const inRange = (value: string | undefined | null, from: string | null, to: string | null) =>
  !!value && (!from || value.slice(0, 10) >= from) && (!to || value.slice(0, 10) <= to);

/** GET /api/shipments filters (GetShipmentParams). Unknown params are ignored, like `page` and `size`. */
function matches(shipment: Shipment, query: URLSearchParams): boolean {
  const get = (name: string) => query.get(name);
  if (get('clientId') && shipment.clientId !== get('clientId')) return false;
  if (get('isAgency') && String(shipment.isAgency) !== get('isAgency')) return false;
  if (get('invoiceStatus') && shipment.invoiceStatus !== get('invoiceStatus')) return false;
  if (get('isInvoiceOverdue') && String(!!shipment.isInvoiceOverdue) !== get('isInvoiceOverdue')) return false;
  if (get('loadStatus') && !shipment.cargo.some((item) => item.loadStatus === get('loadStatus'))) return false;
  if (get('isActive') === 'true' && shipment.cargo.every((item) => item.loadStatus === 'unloaded')) return false;
  if (get('driverId') && !shipment.vehicleStops?.some((stop) => stop.driverId === get('driverId'))) return false;
  if (get('dispatcherId') && shipment.createdById !== get('dispatcherId')) return false;
  if (
    (get('loadingReadyDateFrom') || get('loadingReadyDateTo')) &&
    !shipment.cargo.some((item) =>
      inRange(item.loadingReadyDate, get('loadingReadyDateFrom'), get('loadingReadyDateTo'))
    )
  ) {
    return false;
  }
  if (
    (get('unloadingDueDateFrom') || get('unloadingDueDateTo')) &&
    !shipment.cargo.some((item) =>
      inRange(item.unloadingDueDate, get('unloadingDueDateFrom'), get('unloadingDueDateTo'))
    )
  ) {
    return false;
  }
  return true;
}

/** `sort=field,asc|desc` (Spring style); default newest first. */
function sortShipments(list: Shipment[], sort: string | null): Shipment[] {
  const [field, direction] = (sort ?? 'createdAt,desc').split(',');
  const sign = direction === 'asc' ? 1 : -1;
  return [...list].sort((a, b) => {
    const left = (a as any)[field] ?? '';
    const right = (b as any)[field] ?? '';
    return left < right ? -sign : left > right ? sign : 0;
  });
}

/** The next free number after the highest one in this test's data (`2026/0103` with the seed), so it's predictable. */
function nextOrderNumber(db: Db) {
  const highest = Math.max(0, ...db.nalozi.map((item) => Number(item.orderNumber.split('/')[1]) || 0));
  return `2026/${String(highest + 1).padStart(4, '0')}`;
}

/** Cargo from a create/update body: addresses come as { streetName, postalCodeId }. */
function toStoredCargo(item: any, current?: StoredCargo): StoredCargo {
  const resolve = (value: any) => {
    if (!value?.postalCodeId) return undefined;
    const code = POSTAL_CODES.find((entry) => entry.id === value.postalCodeId);
    return {
      streetName: value.streetName,
      postalCodeId: value.postalCodeId,
      postalCode: code?.postalCode ?? '',
      placeName: code?.placeName ?? '',
      countryCode: code?.countryCode ?? '',
    };
  };
  return {
    ...(current ?? {}),
    ...item,
    id: item.id ?? current?.id ?? newId(),
    loadingAddress: resolve(item.loadingAddress) ?? current?.loadingAddress,
    unloadingAddress: resolve(item.unloadingAddress) ?? current?.unloadingAddress,
  } as StoredCargo;
}

const findShipment = (db: Db, id: string) => db.nalozi.find((entry) => entry.id === id);

export const naloziRoutes = [
  route('GET', '/api/shipments', ({ query }, db) => {
    const list = db.nalozi.map((stored) => toShipment(db, stored)).filter((item) => matches(item, query));
    return paginated(sortShipments(list, query.get('sort')), query);
  }),
  route('GET', '/api/shipments/:id', ({ params }, db) => {
    const found = findShipment(db, params.id);
    return found ? ok(toShipment(db, found)) : notFound('Shipment');
  }),
  route('POST', '/api/shipments', ({ body }, db) => {
    const { cargo = [], draftId: _draftId, ...rest } = body ?? {};
    const created = shipment({
      ...rest,
      id: newId(),
      orderNumber: nextOrderNumber(db),
      createdAt: serverNow(),
      cargo: cargo.map((item: any) => toStoredCargo(item)),
    });
    db.nalozi.push(created);
    return ok(toShipment(db, created), 201);
  }),
  route('PATCH', '/api/shipments/:id', ({ params, body }, db) => {
    const found = findShipment(db, params.id);
    if (!found) return notFound('Shipment');
    const { cargo, ...rest } = body ?? {};
    Object.assign(found, rest);
    if (cargo) {
      found.cargo = cargo.map((item: any) =>
        toStoredCargo(
          item,
          found.cargo.find((existing) => existing.id === item.id)
        )
      );
    }
    return ok(toShipment(db, found));
  }),
  route('DELETE', '/api/shipments/:id', ({ params }, db) => {
    const index = db.nalozi.findIndex((entry) => entry.id === params.id);
    if (index < 0) return notFound('Shipment');
    db.nalozi.splice(index, 1);
    return noContent();
  }),
  route('GET', '/api/shipments/:id/cargo', ({ params }, db) => {
    const found = findShipment(db, params.id);
    return found ? ok(toShipment(db, found).cargo) : notFound('Shipment');
  }),
  route('GET', '/api/shipment-drafts', (_, db) => ok(db.ostalo.drafts)),
];
