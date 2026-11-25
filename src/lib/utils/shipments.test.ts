import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { InvoiceStatus } from '@/lib/api/shipments';

import { buildShipmentPdfFilename, getShipmentOverdueInfo } from './shipments';

const NOW = new Date(2026, 5, 16, 9);
/** A local time in June 2026 as the API's ISO string. */
const june = (day: number, hour = 9) => new Date(2026, 5, day, hour).toISOString();

describe('getShipmentOverdueInfo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const NOT_OVERDUE = { isOverdue: false, dueDate: null, daysOverdue: 0 };

  it.each([
    ['paid', { invoiceStatus: InvoiceStatus.Paid, invoiceStatusUpdatedAt: june(1), termsOfPayment: 1 }],
    ['not invoiced', { invoiceStatus: InvoiceStatus.Sent, invoiceStatusUpdatedAt: null, termsOfPayment: 30 }],
    ['no terms', { invoiceStatus: InvoiceStatus.Sent, invoiceStatusUpdatedAt: june(1), termsOfPayment: undefined }],
    ['0 days terms', { invoiceStatus: InvoiceStatus.Sent, invoiceStatusUpdatedAt: june(1), termsOfPayment: 0 }],
    ['empty terms', { invoiceStatus: InvoiceStatus.Sent, invoiceStatusUpdatedAt: june(1), termsOfPayment: '' }],
  ])('%s → no due date', (_, params) => {
    expect(getShipmentOverdueInfo(params)).toEqual(NOT_OVERDUE);
  });

  it('due = invoiced + terms', () => {
    expect(
      getShipmentOverdueInfo({
        invoiceStatus: InvoiceStatus.Sent,
        invoiceStatusUpdatedAt: june(1),
        termsOfPayment: 30,
      })
    ).toEqual({ isOverdue: false, dueDate: new Date(2026, 6, 1, 9), daysOverdue: 0 });
  });

  it('counts whole days past the due time', () => {
    expect(
      getShipmentOverdueInfo({
        invoiceStatus: InvoiceStatus.Sent,
        invoiceStatusUpdatedAt: june(1, 8),
        termsOfPayment: 10,
      })
    ).toMatchObject({ isOverdue: true, daysOverdue: 5 });
    expect(
      getShipmentOverdueInfo({
        invoiceStatus: InvoiceStatus.Sent,
        invoiceStatusUpdatedAt: june(1, 10),
        termsOfPayment: 10,
      })
    ).toMatchObject({ isOverdue: true, daysOverdue: 4 });
  });

  it('is not overdue at the due moment itself', () => {
    expect(
      getShipmentOverdueInfo({ invoiceStatus: InvoiceStatus.Sent, invoiceStatusUpdatedAt: june(1), termsOfPayment: 15 })
    ).toEqual({ isOverdue: false, dueDate: NOW, daysOverdue: 0 });
  });

  it('a minute late is overdue, 0 days', () => {
    vi.setSystemTime(new Date(2026, 5, 16, 9, 1));
    expect(
      getShipmentOverdueInfo({ invoiceStatus: InvoiceStatus.Sent, invoiceStatusUpdatedAt: june(1), termsOfPayment: 15 })
    ).toMatchObject({ isOverdue: true, daysOverdue: 0 });
  });

  it('takes terms as text; also for a not-sent nalog with a date', () => {
    expect(
      getShipmentOverdueInfo({
        invoiceStatus: InvoiceStatus.NotSent,
        invoiceStatusUpdatedAt: june(1),
        termsOfPayment: '10',
      })
    ).toMatchObject({ isOverdue: true, daysOverdue: 5 });
  });
});

describe('buildShipmentPdfFilename', () => {
  const name = (recipientName: string | undefined, language: 'HR' | 'EN' = 'HR') =>
    buildShipmentPdfFilename({ shipmentId: 's1', orderNumber: '2041', recipientName, language });

  it('order number, recipient slug and the language', () => {
    expect(name('Prijevoz Horvat d.o.o.')).toBe('2041-prijevoz_horvat_d_o_o-nalog.pdf');
    expect(name('Prijevoz Horvat d.o.o.', 'EN')).toBe('2041-prijevoz_horvat_d_o_o-nalog-en.pdf');
  });

  it('drops Croatian diacritics', () => {
    expect(name('Čakovec Špedicija Đurđevac')).toBe('2041-cakovec_spedicija_durdevac-nalog.pdf');
  });

  it.each([undefined, '', '!!!'])('falls back to the shipment id without a usable name (%j)', (recipientName) => {
    expect(name(recipientName)).toBe('shipment-s1.pdf');
    expect(name(recipientName, 'EN')).toBe('shipment-s1-en.pdf');
  });
});
