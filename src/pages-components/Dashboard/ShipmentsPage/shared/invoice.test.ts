import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { INVOICE_AFTER_DAYS } from '@/components/shared/invoice-status-badge';
import type { Shipment } from '@/lib/api';
import { InvoiceStatus, LoadStatus } from '@/lib/api/shipments';

import { getInvoiceInfo, invoiceDateLines } from './invoice';
import { STATUS_TEXT } from './tones';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 5, 16, 9));
});

afterEach(() => {
  vi.useRealTimers();
});

/** A local time in June 2026 as the API's ISO string. */
const june = (day: number, hour = 9) => new Date(2026, 5, day, hour).toISOString();

const unloadStop = (cargoId: string, completedAt?: string) => ({ unloadingCargos: [{ id: cargoId }], completedAt });

const shipment = (overrides: Record<string, unknown> = {}) =>
  ({
    id: 's1',
    invoiceStatus: InvoiceStatus.NotSent,
    invoiceStatusUpdatedAt: null,
    isInvoiceOverdue: false,
    cargo: [{ id: 'cg1', loadStatus: LoadStatus.Unloaded }],
    vehicleStops: [],
    ...overrides,
  }) as unknown as Shipment;

const sent = (overrides: Record<string, unknown> = {}) =>
  shipment({ invoiceStatus: InvoiceStatus.Sent, invoiceStatusUpdatedAt: june(1), ...overrides });

describe('getInvoiceInfo · paid', () => {
  it('says when it was paid', () => {
    expect(
      getInvoiceInfo(shipment({ invoiceStatus: InvoiceStatus.Paid, invoiceStatusUpdatedAt: june(10) }))
    ).toMatchObject({ isLate: false, isUnloaded: true, detail: 'plaćeno 10.6.', detailClass: STATUS_TEXT.success });
  });

  it('without a date', () => {
    expect(getInvoiceInfo(shipment({ invoiceStatus: InvoiceStatus.Paid })).detail).toBe('plaćeno');
  });

  it('is never late, even when flagged overdue', () => {
    expect(
      getInvoiceInfo(shipment({ invoiceStatus: InvoiceStatus.Paid, isInvoiceOverdue: true }), { termsOfPayment: '1' })
        .isLate
    ).toBe(false);
  });
});

describe('getInvoiceInfo · sent', () => {
  it('due later: the due date', () => {
    const info = getInvoiceInfo(sent(), { termsOfPayment: '30' });
    expect(info).toMatchObject({ isLate: false, detail: 'dospijeće 1.7.', detailClass: STATUS_TEXT.muted });
    expect(info.daysPastDue).toBeUndefined();
    expect(info.dueDate).toEqual(new Date(2026, 6, 1, 9));
  });

  it('due today', () => {
    expect(getInvoiceInfo(sent(), { termsOfPayment: '15' })).toMatchObject({
      isLate: false,
      detail: 'dospijeva danas',
      detailClass: STATUS_TEXT.warning,
    });
  });

  it('past due: days late', () => {
    expect(getInvoiceInfo(sent(), { termsOfPayment: '10' })).toMatchObject({
      isLate: true,
      daysPastDue: 5,
      detail: 'kasni 5 d',
      detailClass: STATUS_TEXT.danger,
    });
  });

  it('flagged overdue by the API without terms: late, no day count', () => {
    expect(getInvoiceInfo(sent({ isInvoiceOverdue: true }))).toMatchObject({
      isLate: true,
      daysPastDue: undefined,
      detail: 'kasni',
    });
  });

  it('flagged overdue before the due date: late, no day count', () => {
    expect(getInvoiceInfo(sent({ isInvoiceOverdue: true }), { termsOfPayment: '30' })).toMatchObject({
      isLate: true,
      daysPastDue: undefined,
      detail: 'kasni',
    });
  });

  it('without terms: when it was invoiced', () => {
    expect(getInvoiceInfo(sent())).toMatchObject({ detail: 'fakturirano 1.6.', dueDate: undefined });
    expect(getInvoiceInfo(sent({ invoiceStatusUpdatedAt: null }), { termsOfPayment: '30' }).detail).toBe('fakturirano');
  });

  it('empty terms: no due date', () => {
    expect(getInvoiceInfo(sent(), { termsOfPayment: '' })).toMatchObject({ detail: 'fakturirano 1.6.', isLate: false });
  });
});

describe('getInvoiceInfo · not sent', () => {
  it('not unloaded yet', () => {
    expect(
      getInvoiceInfo(
        shipment({
          cargo: [
            { id: 'cg1', loadStatus: LoadStatus.Unloaded },
            { id: 'cg2', loadStatus: LoadStatus.Loaded },
          ],
        })
      )
    ).toMatchObject({ isUnloaded: false, detail: 'nije istovareno', detailClass: STATUS_TEXT.muted });
  });

  it('a nalog without cargo is not unloaded', () => {
    expect(getInvoiceInfo(shipment({ cargo: [] })).isUnloaded).toBe(false);
  });

  it('unloaded without a stop (agency): no date, never urgent', () => {
    expect(getInvoiceInfo(shipment({ vehicleStops: undefined }))).toMatchObject({
      isUnloaded: true,
      unloadedAt: undefined,
      unloadedDaysAgo: undefined,
      detail: 'istovareno',
      detailClass: STATUS_TEXT.muted,
    });
  });

  it.each([
    [june(16, 7), 'istovareno danas'],
    [june(17, 7), 'istovareno danas'],
    [june(15, 20), 'istovareno jučer'],
    [june(13), 'istovareno prije 3 d'],
  ])('unloaded %s → %s', (completedAt, detail) => {
    expect(getInvoiceInfo(shipment({ vehicleStops: [unloadStop('cg1', completedAt)] })).detail).toBe(detail);
  });

  it(`turns urgent after ${INVOICE_AFTER_DAYS} days`, () => {
    const info = (day: number) => getInvoiceInfo(shipment({ vehicleStops: [unloadStop('cg1', june(day))] }));
    expect(info(16 - INVOICE_AFTER_DAYS + 1)).toMatchObject({
      unloadedDaysAgo: INVOICE_AFTER_DAYS - 1,
      detailClass: STATUS_TEXT.muted,
    });
    expect(info(16 - INVOICE_AFTER_DAYS)).toMatchObject({
      unloadedDaysAgo: INVOICE_AFTER_DAYS,
      detailClass: STATUS_TEXT.warning,
    });
  });

  it('uses the last completed unloading of this nalog’s cargo', () => {
    const info = getInvoiceInfo(
      shipment({
        cargo: [
          { id: 'cg1', loadStatus: LoadStatus.Unloaded },
          { id: 'cg2', loadStatus: LoadStatus.Unloaded },
        ],
        vehicleStops: [
          unloadStop('cg1', june(10)),
          unloadStop('cg2', june(12)),
          unloadStop('other', june(15)),
          unloadStop('cg2', undefined),
        ],
      })
    );
    expect(info).toMatchObject({ unloadedAt: june(12), unloadedDaysAgo: 4, detail: 'istovareno prije 4 d' });
  });
});

describe('invoiceDateLines', () => {
  it('sent: invoiced and due', () => {
    expect(invoiceDateLines(getInvoiceInfo(sent(), { termsOfPayment: '30' }))).toEqual([
      'Fakturirano 1.6.2026.',
      'Valuta 1.7.2026.',
    ]);
  });

  it('paid: when', () => {
    expect(
      invoiceDateLines(
        getInvoiceInfo(shipment({ invoiceStatus: InvoiceStatus.Paid, invoiceStatusUpdatedAt: june(10) }))
      )
    ).toEqual(['Plaćeno 10.6.2026.']);
  });

  it('not sent: when unloaded', () => {
    expect(invoiceDateLines(getInvoiceInfo(shipment({ vehicleStops: [unloadStop('cg1', june(13))] })))).toEqual([
      'Istovareno 13.6.2026.',
    ]);
  });

  it('nothing to say', () => {
    expect(invoiceDateLines(getInvoiceInfo(shipment({ cargo: [] })))).toEqual([]);
  });
});
