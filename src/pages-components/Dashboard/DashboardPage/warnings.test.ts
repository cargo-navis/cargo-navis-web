import { describe, expect, it } from 'vitest';

import { AlertType } from '@/lib/api/alerts';
import type { Alert } from '@/lib/api/alerts.d';
import { InvoiceStatus } from '@/lib/api/shipments';

import { buildWarning, getAlertDate, sortWarnings, type Warning } from './warnings';

const NOW = new Date(2026, 5, 16, 9); // utorak 16.6.2026. 09:00

const clientsById = new Map<string, { name: string; termsOfPayment?: string | number }>([
  ['c1', { name: 'Kraš d.d.', termsOfPayment: 15 }],
  ['c2', { name: 'Podravka d.d.', termsOfPayment: '30' }],
  ['c3', { name: 'Bez valute d.o.o.' }],
]);

const alert = (ruleName: AlertType, alertable: object | null, id = 'a1'): Alert => ({
  id,
  ruleName,
  alertable,
  createdAt: '2026-06-01',
  updatedAt: '2026-06-01',
});

const driver = (patch: object = {}) => ({ firstName: 'Ivan', lastName: 'Horvat', ...patch });
const truck = (patch: object = {}) => ({ registration: 'KC 456-CD', ...patch });

const invoice = (patch: object = {}) => ({
  orderNumber: '2009/2026',
  clientId: 'c1',
  price: 1180,
  invoiceStatus: InvoiceStatus.Sent,
  invoiceStatusUpdatedAt: '2026-05-20T12:00:00', // + 15 d = 4.6.2026., 12 days before NOW
  ...patch,
});

const build = (value: Alert, now = NOW) => buildWarning(value, { clientsById, now });

describe('buildWarning · expiry wording', () => {
  it.each([
    [AlertType.DRIVER_LICENCE_EXPIRED, 'driverLicenceExpiryDate', 'Istekla prije 3 d'],
    [AlertType.DRIVER_VISA_EXPIRED, 'visaExpiryDate', 'Istekla prije 3 d'],
    [AlertType.DRIVER_TACHOGRAPH_CARD_EXPIRED, 'driverTachographCardExpiryDate', 'Istekla prije 3 d'],
    [AlertType.EMPLOYEE_CONTRACT_EXPIRED, 'contractExpiryDate', 'Istekao prije 3 d'],
    [AlertType.DRIVER_CODE_95_EXPIRED, 'code95ExpiryDate', 'Istekao prije 3 d'],
    [AlertType.DRIVER_GOV_ID_EXPIRED, 'governmentIdExpiryDate', 'Istekao prije 3 d'],
  ])('%s agrees in gender (%s)', (rule, property, detail) => {
    expect(build(alert(rule, driver({ [property]: '2026-06-13' }))).detail).toBe(detail);
  });

  it.each([
    [AlertType.VEHICLE_REGISTRATION_EXPIRED, 'registrationExpiryDate', 'Istekla prije 3 d'],
    [AlertType.VEHICLE_TIRES_REPLACEMENT_EXPIRED, 'tiresReplacementExpiryDate', 'Istekla prije 3 d'],
    [AlertType.VEHICLE_TACHOGRAPH_EXPIRED, 'tachographExpiryDate', 'Istekao prije 3 d'],
    [AlertType.VEHICLE_LEASING_EXPIRED, 'leasingExpiryDate', 'Istekao prije 3 d'],
    [AlertType.VEHICLE_MANDATORY_INSURANCE_EXPIRED, 'mandatoryInsuranceExpiryDate', 'Isteklo prije 3 d'],
    [AlertType.VEHICLE_OPTIONAL_INSURANCE_EXPIRED, 'optionalInsuranceExpiryDate', 'Isteklo prije 3 d'],
  ])('%s agrees in gender (%s)', (rule, property, detail) => {
    expect(build(alert(rule, truck({ [property]: '2026-06-13' }))).detail).toBe(detail);
  });

  it.each([
    ['2026-06-15', -1, 'expired', 'Istekla prije 1 d'],
    ['2026-06-16', 0, 'soon', 'Istječe danas'],
    ['2026-06-17', 1, 'soon', 'Istječe za 1 d'],
    ['2026-07-16', 30, 'soon', 'Istječe za 30 d'],
  ])('%s is %i days away', (date, days, severity, detail) => {
    expect(build(alert(AlertType.DRIVER_LICENCE_EXPIRED, driver({ driverLicenceExpiryDate: date })))).toMatchObject({
      days,
      severity,
      detail,
    });
  });

  it('counts calendar days, not hours', () => {
    const lateEvening = new Date(2026, 5, 16, 23, 59);
    const tomorrow = alert(AlertType.DRIVER_VISA_EXPIRED, driver({ visaExpiryDate: '2026-06-17' }));
    expect(build(tomorrow, lateEvening).detail).toBe('Istječe za 1 d');

    const thisMorning = alert(AlertType.DRIVER_VISA_EXPIRED, driver({ visaExpiryDate: '2026-06-16T00:01:00' }));
    expect(build(thisMorning, lateEvening).detail).toBe('Istječe danas');
  });

  it.each([
    ['across new year', '2025-12-30', new Date(2026, 0, 1, 8), 'Istekla prije 2 d'],
    ['across a month end', '2026-07-01', new Date(2026, 5, 30, 8), 'Istječe za 1 d'],
    ['over a leap day', '2028-02-28', new Date(2028, 2, 1, 8), 'Istekla prije 2 d'],
    ['up to a leap day', '2028-02-29', new Date(2028, 1, 28, 8), 'Istječe za 1 d'],
  ])('counts %s', (_, date, now, detail) => {
    expect(build(alert(AlertType.DRIVER_LICENCE_EXPIRED, driver({ driverLicenceExpiryDate: date })), now).detail).toBe(
      detail
    );
  });

  it('treats a missing date as expired, without a number', () => {
    expect(build(alert(AlertType.VEHICLE_REGISTRATION_EXPIRED, truck()))).toMatchObject({
      severity: 'expired',
      days: undefined,
      detail: 'Istekla',
    });
    expect(build(alert(AlertType.VEHICLE_ADR_EXPIRED, truck())).detail).toBe('Istekao');
    expect(build(alert(AlertType.VEHICLE_MANDATORY_INSURANCE_EXPIRED, truck())).detail).toBe('Isteklo');
  });
});

describe('buildWarning · titles and kinds', () => {
  it('puts the vehicle registration first and keeps the shared label', () => {
    expect(
      build(
        alert(AlertType.VEHICLE_TECHNICAL_INSPECTION_EXPIRED, truck({ technicalInspectionExpiryDate: '2026-06-20' }))
      )
    ).toMatchObject({
      kind: 'vehicle',
      title: 'KC 456-CD · Tehnički pregled',
      name: 'KC 456-CD',
      subject: 'Tehnički pregled',
    });
  });

  it('shortens „Registracija vozila” to „Registracija”', () => {
    expect(build(alert(AlertType.VEHICLE_REGISTRATION_EXPIRED, truck())).subject).toBe('Registracija');
  });

  it.each([
    [AlertType.EMPLOYEE_CONTRACT_EXPIRED, 'Ugovor o zaposlenju'],
    [AlertType.PROFESSIONAL_DRIVER_LICENCE_EXPIRED, 'Profesionalna vozačka dozvola'],
    [AlertType.DRIVER_ADR_EXPIRED, 'ADR'],
    [AlertType.DRIVER_POSTING_DECLARATION_EXPIRED, 'Izjava o upućivanju'],
  ])('%s is a document of the person', (rule, subject) => {
    expect(build(alert(rule, driver()))).toMatchObject({
      kind: 'document',
      title: `Ivan Horvat · ${subject}`,
      name: 'Ivan Horvat',
      subject,
    });
  });

  it('uses whatever part of the name there is', () => {
    expect(build(alert(AlertType.DRIVER_VISA_EXPIRED, { firstName: 'Ivan' })).title).toBe('Ivan · Viza');
    expect(build(alert(AlertType.DRIVER_VISA_EXPIRED, { lastName: 'Horvat' })).title).toBe('Horvat · Viza');
  });

  it('falls back to the subject alone when the owner is unknown', () => {
    expect(build(alert(AlertType.DRIVER_VISA_EXPIRED, {}))).toMatchObject({
      title: 'Viza',
      name: 'Viza',
      subject: undefined,
    });
    expect(build(alert(AlertType.VEHICLE_REGISTRATION_EXPIRED, null))).toMatchObject({
      kind: 'vehicle',
      title: 'Registracija',
      detail: 'Istekla',
    });
  });

  it('shows the company cargo insurance with its own title (neuter)', () => {
    expect(
      build(
        alert(AlertType.TENANT_INSURANCE_EXPIRED, { name: 'Prijevoz d.o.o.', cargoInsuranceExpiryDate: '2026-06-06' })
      )
    ).toMatchObject({
      kind: 'company',
      severity: 'expired',
      title: 'Osiguranje tereta',
      name: 'Osiguranje tereta',
      subject: undefined,
      detail: 'Isteklo prije 10 d',
      days: -10,
    });
  });

  it('keeps the alert id', () => {
    expect(build(alert(AlertType.DRIVER_VISA_EXPIRED, driver(), 'alert-42')).id).toBe('alert-42');
  });
});

describe('buildWarning · overdue invoices', () => {
  const detail = (warning: Warning) => warning.detail.replace(/\s/g, ' ');

  it('is due the payment terms after it was sent', () => {
    const warning = build(alert(AlertType.SHIPMENT_INVOICE_OVERDUE, invoice()));
    expect(warning).toMatchObject({
      kind: 'invoice',
      severity: 'expired',
      days: -12,
      title: 'Faktura 2009/2026 · Kraš d.d.',
    });
    expect(detail(warning)).toBe('Dospjela prije 12 d · 1.180 €');
  });

  it('reads the terms given as a string', () => {
    const sent = invoice({ clientId: 'c2', invoiceStatusUpdatedAt: '2026-05-10T12:00:00' }); // + 30 d = 9.6.
    const warning = build(alert(AlertType.SHIPMENT_INVOICE_OVERDUE, sent));
    expect(warning.title).toBe('Faktura 2009/2026 · Podravka d.d.');
    expect(warning.days).toBe(-7);
  });

  it('is „Dospjela danas” on the due day', () => {
    const dueToday = invoice({ invoiceStatusUpdatedAt: '2026-06-01T12:00:00' });
    expect(detail(build(alert(AlertType.SHIPMENT_INVOICE_OVERDUE, dueToday)))).toBe('Dospjela danas · 1.180 €');
  });

  it('leaves the amount out when there is no price', () => {
    expect(build(alert(AlertType.SHIPMENT_INVOICE_OVERDUE, invoice({ price: 0 }))).detail).toBe('Dospjela prije 12 d');
    expect(build(alert(AlertType.SHIPMENT_INVOICE_OVERDUE, invoice({ price: null }))).detail).toBe(
      'Dospjela prije 12 d'
    );
  });

  it.each([
    ['the client has no terms', { clientId: 'c3' }, 'Faktura 2009/2026 · Bez valute d.o.o.'],
    ['the client is unknown', { clientId: 'missing' }, 'Faktura 2009/2026'],
    ['there is no client', { clientId: null }, 'Faktura 2009/2026'],
    ['it was never sent', { invoiceStatusUpdatedAt: null }, 'Faktura 2009/2026 · Kraš d.d.'],
    ['it is paid', { invoiceStatus: InvoiceStatus.Paid }, 'Faktura 2009/2026 · Kraš d.d.'],
  ])('is just „Dospjela” when %s', (_, patch, title) => {
    const warning = build(alert(AlertType.SHIPMENT_INVOICE_OVERDUE, invoice({ price: 0, ...patch })));
    expect(warning).toMatchObject({ severity: 'expired', days: undefined, detail: 'Dospjela', title });
  });
});

describe('getAlertDate', () => {
  it('reads the expiry property of the rule', () => {
    const value = alert(AlertType.VEHICLE_ADR_EXPIRED, truck({ adrExpiryDate: '2026-07-01' }));
    expect(getAlertDate(value, { clientsById })).toBe('2026-07-01');
  });

  it('is null when the property or the alertable is missing', () => {
    expect(getAlertDate(alert(AlertType.VEHICLE_ADR_EXPIRED, truck()), { clientsById })).toBeNull();
    expect(getAlertDate(alert(AlertType.VEHICLE_ADR_EXPIRED, null), { clientsById })).toBeNull();
  });

  it('computes the due date of an invoice from the client terms', () => {
    const due = getAlertDate(alert(AlertType.SHIPMENT_INVOICE_OVERDUE, invoice()), { clientsById });
    expect(due).toEqual(new Date(2026, 5, 4, 12));
  });
});

describe('sortWarnings', () => {
  const warning = (severity: Warning['severity'], days?: number) => ({ severity, days });

  it('puts expired ones with an unknown date first', () => {
    const sorted = sortWarnings([
      warning('expired', -2),
      warning('soon', 0),
      warning('expired'),
      warning('expired', -9),
    ]);
    expect(sorted).toEqual([warning('expired'), warning('expired', -9), warning('expired', -2), warning('soon', 0)]);
  });

  it('keeps today before later ones among the soon ones', () => {
    const sorted = sortWarnings([warning('soon', 5), warning('soon', 0), warning('soon', 1)]);
    expect(sorted.map((item) => item.days)).toEqual([0, 1, 5]);
  });

  it('does not change the given list', () => {
    const list = [warning('soon', 5), warning('expired', -1)];
    sortWarnings(list);
    expect(list.map((item) => item.days)).toEqual([5, -1]);
  });

  it('handles an empty list', () => {
    expect(sortWarnings([])).toEqual([]);
  });
});
