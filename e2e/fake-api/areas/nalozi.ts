import type { ShipmentDraft } from '@/lib/api/shipment-drafts.d';
import type { Cargo, Shipment } from '@/lib/api/shipments.d';

import { at, day, serverNow } from '../../support/time';
import type { Db } from '../db';
import { type FakeRequest, formField, noContent, notFound, ok, paginated, pdf, route } from '../http';
import { newId, uuid } from '../ids';
import { KORISNIK_ID } from './korisnik';
import { POSTAL_CODES, postalCode } from './ostalo';
import { KLIJENT, PODVOZAR } from './partneri';
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
  /** Agency: Kraš's order passed on to podvozar Brzica; utovar in 3 days, istovar in 4, no dates on the second teret. */
  agencija: uuid(504),
};

export const TERET = {
  podravka: uuid(601),
  atlantic: uuid(602),
  kras: uuid(603),
  agencija: uuid(604),
  agencijaBezDatuma: uuid(605),
};

type StoredCargo = Omit<Cargo, 'loadStatus'>;
export type StoredShipment = Omit<Shipment, 'cargo' | 'vehicleStops'> & { cargo: StoredCargo[] };

const address = (streetName: string, code: string) => {
  const { id, ...rest } = postalCode(code);
  return { streetName, postalCodeId: id, ...rest };
};

const metadata = (palleteAmount: number) => ({
  type: 'standard',
  palleteType: 'euro',
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
    shipment({
      id: NALOG.agencija,
      orderNumber: '2026/0100',
      externalOrderReference: 'KR-120',
      clientId: KLIJENT.kras,
      price: 2100,
      createdAt: at(-3, 8),
      isAgency: true,
      transportContractorId: PODVOZAR.brzica,
      childId: uuid(554),
      contractorOrderNumber: '2026/0100-P',
      contractorExternalOrderReference: 'BRZ-77',
      contractorPrice: 1650,
      contractorInvoiceStatus: 'not_sent' as Shipment['invoiceStatus'],
      cargo: [
        {
          id: TERET.agencija,
          weight: 9_000,
          ldm: 5,
          description: 'Bombonijere',
          metadata: metadata(12),
          loadingAddress: address('Ravnice 48', '10000'),
          loadingCompanyName: 'Kraš d.d.',
          loadingReadyDate: day(3),
          unloadingAddress: address('Industriestraße 1', '80331'),
          unloadingCompanyName: 'Rewe München',
          unloadingDueDate: day(4),
        },
        {
          id: TERET.agencijaBezDatuma,
          weight: 2_000,
          ldm: 1.2,
          description: 'Reklamni materijal',
          metadata: metadata(3),
          loadingAddress: address('Ravnice 48', '10000'),
          loadingCompanyName: 'Kraš d.d.',
          unloadingAddress: address('Letališka 3', '1000'),
          unloadingCompanyName: 'Mercator d.d.',
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
  // „Utovar ili istovar”: a teret's ready OR due date in the range.
  if (
    (get('activityDateFrom') || get('activityDateTo')) &&
    !shipment.cargo.some(
      (item) =>
        inRange(item.loadingReadyDate, get('activityDateFrom'), get('activityDateTo')) ||
        inRange(item.unloadingDueDate, get('activityDateFrom'), get('activityDateTo'))
    )
  ) {
    return false;
  }
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

/**
 * The value a sort field reads: the nalog's own field, or for the cargo dates the earliest one (undated last);
 * `activityDate` = the earliest ready or due date inside the activityDate range.
 */
function sortValue(shipment: Shipment, field: string, query: URLSearchParams): string | number {
  if (field === 'activityDate') {
    const [from, to] = [query.get('activityDateFrom'), query.get('activityDateTo')];
    const dates = shipment.cargo
      .flatMap((item) => [item.loadingReadyDate, item.unloadingDueDate])
      .filter((value): value is string => inRange(value, from, to))
      .map((value) => value.slice(0, 10));
    return dates.length ? dates.sort()[0] : '';
  }
  if (field === 'loadingReadyDate' || field === 'unloadingDueDate') {
    const dates = shipment.cargo.map((item) => item[field]).filter((value): value is string => !!value);
    return dates.length ? dates.sort()[0] : '';
  }
  return (shipment as any)[field] ?? '';
}

/** `sort=field,asc|desc` (Spring style); default newest first. Ties by order number, lowest first (as the backend). */
function sortShipments(list: Shipment[], query: URLSearchParams): Shipment[] {
  const [field, direction] = (query.get('sort') ?? 'createdAt,desc').split(',');
  const sign = direction === 'asc' ? 1 : -1;
  return [...list].sort((a, b) => {
    const left = sortValue(a, field, query);
    const right = sortValue(b, field, query);
    if (left !== right) return left < right ? -sign : sign;
    return a.orderNumber < b.orderNumber ? -1 : a.orderNumber > b.orderNumber ? 1 : 0;
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

/** Agency create/update bodies: the parent carries the client side, `contractor*` the carrier side. */
function applyAgency(target: StoredShipment, body: any) {
  const { cargo, draftId: _draftId, ...rest } = body ?? {};
  Object.assign(target, rest, { isAgency: true });
  if (cargo) {
    target.cargo = cargo.map((item: any) =>
      toStoredCargo(
        item,
        target.cargo.find((existing) => existing.id === item.id)
      )
    );
  }
}

function addDocument(db: Db, request: FakeRequest, shipmentId: string) {
  const found = findShipment(db, shipmentId);
  if (!found) return notFound('Shipment');
  const name = formField(request, 'fileName') ?? formField(request, 'file') ?? 'dokument.pdf';
  found.documents = [
    ...(found.documents ?? []),
    {
      id: newId(),
      createdAt: serverNow(),
      name,
      mimeType: 'application/pdf',
      status: 'UPLOADED',
      uploadedBy: KORISNIK_ID,
    },
  ];
  return ok(toShipment(db, found), 201);
}

function removeDocument(db: Db, shipmentId: string, documentId: string) {
  const found = findShipment(db, shipmentId);
  if (!found) return notFound('Shipment');
  found.documents = (found.documents ?? []).filter((document) => document.id !== documentId);
  return noContent();
}

/** A signed URL to the document, as the backend returns it (the app opens it in a new tab). */
const documentUrl = (path: string) => ok(`http://localhost/e2e-files${path}`);

export const naloziRoutes = [
  route('GET', '/api/shipments', ({ query }, db) => {
    const list = db.nalozi.map((stored) => toShipment(db, stored)).filter((item) => matches(item, query));
    return paginated(sortShipments(list, query), query);
  }),
  route('GET', '/api/shipments/:id/generate-pdf', ({ params }, db) =>
    findShipment(db, params.id) ? pdf() : notFound('Shipment')
  ),
  route('GET', '/api/shipments/:id/cargo', ({ params }, db) => {
    const found = findShipment(db, params.id);
    return found ? ok(toShipment(db, found).cargo) : notFound('Shipment');
  }),
  route('PATCH', '/api/shipments/:id/cargo/:cargoId', ({ params, body }, db) => {
    const found = findShipment(db, params.id);
    const cargo = found?.cargo.find((item) => item.id === params.cargoId);
    if (!found || !cargo) return notFound('Cargo');
    Object.assign(cargo, body);
    return ok(toShipment(db, found).cargo.find((item) => item.id === params.cargoId));
  }),
  route('GET', '/api/shipments/:id', ({ params }, db) => {
    const found = findShipment(db, params.id);
    // Agency nalozi too: the detail, edit and copy pages load every nalog from here.
    return found ? ok(toShipment(db, found)) : notFound('Shipment');
  }),
  route('POST', '/api/shipments', ({ body }, db) => {
    const { cargo = [], draftId, ...rest } = body ?? {};
    const created = shipment({
      ...rest,
      id: newId(),
      orderNumber: nextOrderNumber(db),
      createdAt: serverNow(),
      cargo: cargo.map((item: any) => toStoredCargo(item)),
    });
    db.nalozi.push(created);
    confirmDraft(db, draftId, created.id);
    return ok(toShipment(db, created), 201);
  }),
  route('PATCH', '/api/shipments/:id', ({ params, body }, db) => {
    const found = findShipment(db, params.id);
    if (!found) return notFound('Shipment');
    const { cargo, ...rest } = body ?? {};
    Object.assign(found, rest);
    if (rest.invoiceStatus) found.invoiceStatusUpdatedAt = serverNow();
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
  route('POST', '/api/shipments/:id/convert-to-agency', ({ params, body }, db) => {
    const found = findShipment(db, params.id);
    if (!found) return notFound('Shipment');
    applyAgency(found, { ...body, childId: newId(), contractorOrderNumber: `${found.orderNumber}-P` });
    return ok(toShipment(db, found));
  }),
  route('POST', '/api/shipments/:id/files', (request, db) => addDocument(db, request, request.params.id)),
  route('GET', '/api/shipments/:id/files/:documentId', ({ params }) =>
    documentUrl(`/shipments/${params.id}/${params.documentId}`)
  ),
  route('DELETE', '/api/shipments/:id/files/:documentId', ({ params }, db) =>
    removeDocument(db, params.id, params.documentId)
  ),

  // Agency nalozi: one resource for the parent (towards the client) with the child's (carrier's) fields on it.
  route('POST', '/api/agency-shipments', ({ body }, db) => {
    const created = shipment({ id: newId(), orderNumber: nextOrderNumber(db), createdAt: serverNow(), cargo: [] });
    applyAgency(created, {
      ...body,
      childId: newId(),
      contractorOrderNumber: `${created.orderNumber}-P`,
      contractorInvoiceStatus: 'not_sent',
    });
    db.nalozi.push(created);
    confirmDraft(db, body?.draftId, created.id);
    return ok(toShipment(db, created), 201);
  }),
  route('GET', '/api/agency-shipments/:id', ({ params }, db) => {
    const found = findShipment(db, params.id);
    return found?.isAgency ? ok(toShipment(db, found)) : notFound('Agency shipment');
  }),
  route('PATCH', '/api/agency-shipments/:id', ({ params, body }, db) => {
    const found = findShipment(db, params.id);
    if (!found?.isAgency) return notFound('Agency shipment');
    applyAgency(found, body);
    if (body?.invoiceStatus) found.invoiceStatusUpdatedAt = serverNow();
    return ok(toShipment(db, found));
  }),
  route('DELETE', '/api/agency-shipments/:id', ({ params }, db) => {
    const index = db.nalozi.findIndex((entry) => entry.id === params.id && entry.isAgency);
    if (index < 0) return notFound('Agency shipment');
    db.nalozi.splice(index, 1);
    return noContent();
  }),
  route('POST', '/api/agency-shipments/:id/convert-to-regular', ({ params }, db) => {
    const found = findShipment(db, params.id);
    if (!found?.isAgency) return notFound('Agency shipment');
    Object.assign(found, {
      isAgency: false,
      childId: null,
      contractorOrderNumber: null,
      contractorExternalOrderReference: null,
      contractorPrice: null,
      contractorInvoiceStatus: null,
    });
    return ok(toShipment(db, found));
  }),
  route('POST', '/api/agency-shipments/:id/files', (request, db) => addDocument(db, request, request.params.id)),
  route('GET', '/api/agency-shipments/:id/files/:documentId', ({ params }) =>
    documentUrl(`/agency-shipments/${params.id}/${params.documentId}`)
  ),
  route('DELETE', '/api/agency-shipments/:id/files/:documentId', ({ params }, db) =>
    removeDocument(db, params.id, params.documentId)
  ),

  // Nalozi u pripremi (PDF drafts). Upload answers PROCESSING; tests move a draft on with `extractDraft()`.
  route('GET', '/api/shipment-drafts', (_, db) => ok(db.ostalo.drafts)),
  route('GET', '/api/shipment-drafts/:id', ({ params }, db) => {
    const draft = db.ostalo.drafts.find((item) => item.id === params.id);
    return draft ? ok(draft) : notFound('Draft');
  }),
  route('POST', '/api/shipment-drafts', (request, db) => {
    const fileName = formField(request, 'fileName') ?? formField(request, 'file') ?? 'nalog.pdf';
    const now = serverNow();
    const draft: ShipmentDraft = {
      id: newId(),
      fileName,
      status: 'PROCESSING',
      source: 'MANUAL_UPLOAD',
      shipmentId: null,
      aiExtractedData: null,
      changeRatio: null,
      errorMessage: null,
      createdAt: now,
      updatedAt: now,
      document: {
        id: newId(),
        createdAt: now,
        name: fileName,
        mimeType: 'application/pdf',
        status: 'UPLOADED',
        publicUrl: null,
      },
    };
    db.ostalo.drafts.push(draft);
    return ok(draft, 201);
  }),
  route('DELETE', '/api/shipment-drafts/:id', ({ params }, db) => {
    const index = db.ostalo.drafts.findIndex((item) => item.id === params.id);
    if (index < 0) return notFound('Draft');
    db.ostalo.drafts.splice(index, 1);
    return noContent();
  }),
  route('GET', '/api/shipment-drafts/:id/files/:documentId', ({ params }) =>
    documentUrl(`/shipment-drafts/${params.id}/${params.documentId}`)
  ),
];

function confirmDraft(db: Db, draftId: string | undefined, shipmentId: string) {
  const draft = draftId && db.ostalo.drafts.find((item) => item.id === draftId);
  if (!draft) return;
  draft.status = 'CONFIRMED';
  draft.shipmentId = shipmentId;
  draft.updatedAt = serverNow();
}

/**
 * Finishes the AI extraction of a draft, as the backend does in the background: status EXTRACTED and the parsed data.
 * Tests call it, then make the app refetch (the app learns it from a notification or on reload).
 */
export function extractDraft(db: Db, draftId: string, data: ShipmentDraft['aiExtractedData']) {
  const draft = db.ostalo.drafts.find((item) => item.id === draftId);
  if (!draft) throw new Error(`E2E: no draft ${draftId}`);
  draft.status = 'EXTRACTED';
  draft.aiExtractedData = data;
  draft.updatedAt = serverNow();
}

/**
 * `count` extra own nalozi for list tests (pagination, sorting): 2026/1001…, Podravka, created one hour apart before the
 * seed ones, each with one dated teret Zagreb → Split. Push them into `fakeApi.db.nalozi` before the page loads.
 */
export function manyNalozi(count: number): StoredShipment[] {
  return Array.from({ length: count }, (_, index) =>
    shipment({
      id: uuid(5_000 + index),
      orderNumber: `2026/${1001 + index}`,
      clientId: KLIJENT.podravka,
      price: 500 + index * 10,
      createdAt: new Date(new Date(at(-20, 8)).getTime() - index * 3_600_000).toISOString(),
      cargo: [
        {
          id: uuid(6_000 + index),
          weight: 1_000,
          ldm: 1,
          description: '',
          metadata: metadata(2),
          loadingAddress: address('Radnička cesta 1', '10000'),
          loadingReadyDate: day(5 + (index % 5)),
          unloadingAddress: address('Domovinskog rata 2', '21000'),
          unloadingDueDate: day(6 + (index % 5)),
        },
      ],
    })
  );
}
