import { describe, expect, it } from 'vitest';

import { AlertType } from '@/lib/api/alerts';
import type { Alert } from '@/lib/api/alerts.d';
import { InvoiceStatus, LoadStatus } from '@/lib/api/shipments';
import type { Cargo, Shipment } from '@/lib/api/shipments.d';
import type { VehicleStop } from '@/lib/api/vehicleStops.d';

import { formatAgo, formatLongToday, greeting } from './format';
import { buildTodayStops, summarizeCargo } from './todayStops';
import { buildWarning, sortWarnings } from './warnings';

const NOW = new Date(2026, 10, 10, 9, 30); // utorak 10.11.2026. 09:30

const address = (postalCode: string, placeName: string, countryCode = 'HR') => ({
  streetName: 'Ulica 1',
  postalCodeId: postalCode,
  postalCode,
  placeName,
  countryCode,
});

const cargo = (id: string, patch: Partial<Cargo> = {}): Cargo => ({
  id,
  weight: 9000,
  ldm: 6.8,
  description: '',
  metadata: { type: 'standard', palleteType: 'EUR', palleteAmount: 16, width: 0, height: 0, length: 0 },
  loadingAddress: address('10000', 'Zagreb'),
  unloadingAddress: address('80939', 'München', 'DE'),
  ...patch,
});

const shipment = (id: string, patch: Partial<Shipment> = {}): Shipment =>
  ({
    id,
    orderNumber: `${id}/2026`,
    createdById: 'u1',
    clientId: 'c1',
    invoiceStatus: InvoiceStatus.NotSent,
    invoiceStatusUpdatedAt: null,
    isInvoiceOverdue: null,
    price: 1180,
    cargo: [],
    createdAt: '2026-11-01',
    isAgency: false,
    childId: null,
    contractorOrderNumber: null,
    contractorExternalOrderReference: null,
    contractorPrice: null,
    contractorInvoiceStatus: null,
    ...patch,
  }) as Shipment;

const stop = (patch: Partial<VehicleStop>): VehicleStop =>
  ({
    id: 's',
    createdAt: '',
    vehicleId: 'v1',
    previousStopId: null,
    address: null,
    date: '2026-11-10',
    driverId: 'd1',
    trailerId: null,
    disponentId: null,
    loadingCargos: [],
    unloadingCargos: [],
    documents: [],
    messageSentAt: null,
    ...patch,
  }) as VehicleStop;

describe('summarizeCargo', () => {
  it('shows pallets first, else LDM, then tonnes', () => {
    expect(summarizeCargo([cargo('a'), cargo('b')])).toBe('32 pal · 18 t');
    expect(summarizeCargo([cargo('a', { metadata: { ...cargo('a').metadata, type: 'nonstandard' }, ldm: 13.6 })])).toBe(
      '13,6 LDM · 9 t'
    );
  });
});

describe('buildTodayStops', () => {
  it('makes one row per nalog, kind and place, done from the vehicle stop, finished ones last', () => {
    const done = shipment('2052', {
      cargo: [cargo('k1', { loadingReadyDate: '2026-11-10' }), cargo('k2', { loadingReadyDate: '2026-11-10' })],
      vehicleStops: [
        stop({ completedAt: '2026-11-10T08:00:00Z', loadingCargos: [{ id: 'k1' }, { id: 'k2' }] as never }),
      ],
    });
    const open = shipment('2053', {
      cargo: [cargo('k3', { loadingReadyDate: '2026-11-10', unloadingDueDate: '2026-11-10' })],
    });
    const agency = shipment('2054', {
      isAgency: true,
      transportContractorId: 'k',
      cargo: [cargo('k4', { unloadingDueDate: '2026-11-10', loadStatus: LoadStatus.Unloaded })],
    });

    const rows = buildTodayStops([done, open, agency, open], NOW);
    expect(rows.map((row) => [row.orderNumber, row.kind, row.done, row.place])).toEqual([
      ['2053/2026', 'utovar', false, '10000 Zagreb'],
      ['2053/2026', 'istovar', false, '80939 München'],
      ['2052/2026', 'utovar', true, '10000 Zagreb'],
      ['2054/2026', 'istovar', true, '80939 München'],
    ]);
    expect(rows[2]).toMatchObject({ cargo: '32 pal · 18 t', vehicleId: 'v1', driverId: 'd1' });
    expect(rows[1].vehicleId).toBeUndefined();
  });

  it('never borrows the vehicle of another teret for an unassigned one', () => {
    const partly = shipment('2060', {
      cargo: [cargo('a1', { loadingReadyDate: '2026-11-10' }), cargo('a2', { unloadingDueDate: '2026-11-10' })],
      vehicleStops: [stop({ loadingCargos: [{ id: 'a1' }] as never })],
    });
    const rows = buildTodayStops([partly], NOW);
    expect(rows.map((row) => [row.kind, row.vehicleId])).toEqual([
      ['utovar', 'v1'],
      ['istovar', undefined],
    ]);
  });
});

describe('buildWarning', () => {
  const clientsById = new Map([['c1', { name: 'Kraš d.d.', termsOfPayment: 30 }]]);
  const alert = (ruleName: AlertType, alertable: object): Alert => ({
    id: ruleName,
    ruleName,
    alertable,
    createdAt: '2026-11-01',
    updatedAt: '2026-11-01',
  });

  it('agrees with the document (Istekla registracija, Istekao pregled)', () => {
    expect(
      buildWarning(
        alert(AlertType.VEHICLE_REGISTRATION_EXPIRED, {
          registration: 'KC 456-CD',
          registrationExpiryDate: '2026-11-02',
        }),
        { clientsById, now: NOW }
      )
    ).toMatchObject({
      kind: 'vehicle',
      severity: 'expired',
      title: 'KC 456-CD · Registracija',
      name: 'KC 456-CD',
      subject: 'Registracija',
      detail: 'Istekla prije 8 d',
    });
    expect(
      buildWarning(
        alert(AlertType.DRIVER_MEDICAL_EXAMINATION_EXPIRED, {
          firstName: 'Ivan',
          lastName: 'Horvat',
          medicalExaminationExpiryDate: '2026-11-28',
        }),
        { clientsById, now: NOW }
      )
    ).toMatchObject({
      kind: 'document',
      severity: 'soon',
      title: 'Ivan Horvat · Liječnički pregled',
      detail: 'Istječe za 18 d',
    });
  });

  it('shows how long an invoice is overdue and its amount', () => {
    const warning = buildWarning(
      alert(AlertType.SHIPMENT_INVOICE_OVERDUE, {
        orderNumber: '2009/2026',
        clientId: 'c1',
        price: 1180,
        invoiceStatus: InvoiceStatus.Sent,
        invoiceStatusUpdatedAt: '2026-10-08T12:00:00',
      }),
      { clientsById, now: NOW }
    );
    expect(warning).toMatchObject({
      kind: 'invoice',
      severity: 'expired',
      title: 'Faktura 2009/2026 · Kraš d.d.',
      name: 'Faktura 2009/2026',
      subject: 'Kraš d.d.',
    });
    expect(warning.detail.replace(/\s/g, ' ')).toBe('Dospjela prije 3 d · 1.180 €');
  });

  it('sorts expired (longest ago first) before soon (soonest first)', () => {
    const sorted = sortWarnings([
      { severity: 'soon' as const, days: 18 },
      { severity: 'expired' as const, days: -3 },
      { severity: 'soon' as const, days: 10 },
      { severity: 'expired' as const, days: -12 },
    ]);
    expect(sorted.map((warning) => warning.days)).toEqual([-12, -3, 10, 18]);
  });
});

describe('format', () => {
  it('formats activity times', () => {
    expect(formatAgo(new Date(2026, 10, 10, 9, 18), NOW)).toBe('prije 12 min');
    expect(formatAgo(new Date(2026, 10, 10, 7, 0), NOW)).toBe('prije 2 h');
    expect(formatAgo(new Date(2026, 10, 9, 18, 20), NOW)).toBe('jučer 18:20');
    expect(formatAgo(new Date(2026, 10, 7, 8, 42), NOW)).toBe('7.11. 08:42');
    expect(formatAgo(new Date(2025, 10, 7, 8, 42), NOW)).toBe('7.11.2025.');
  });

  it('titles the day and greets by the hour', () => {
    expect(formatLongToday(NOW)).toBe('utorak, 10. studenoga');
    expect(greeting(NOW)).toBe('Dobro jutro');
    expect(greeting(new Date(2026, 10, 10, 19))).toBe('Dobra večer');
  });
});
