import { INVOICE_AFTER_DAYS, INVOICE_STATUS_LABEL } from '@/components/shared/invoice-status-badge';
import type { Client, Shipment } from '@/lib/api';
import { InvoiceStatus, LoadStatus } from '@/lib/api/shipments';
import { daysFromToday, formatDate, formatDateShort } from '@/lib/utils/date';
import { getShipmentOverdueInfo } from '@/lib/utils/shipments';

import { STATUS_TEXT } from './tones';

export const INVOICE_STATUSES = [InvoiceStatus.NotSent, InvoiceStatus.Sent, InvoiceStatus.Paid];
export { INVOICE_STATUS_LABEL };

/**
 * What the invoice column / Faktura panel say about a nalog (lab /invoice „B, amber”): the status and the one detail
 * that matters now. From the API: `invoiceStatus`, `invoiceStatusUpdatedAt` (= invoiced / paid on), `isInvoiceOverdue`,
 * the client's `termsOfPayment` (due date = invoiced + terms, as today's „Dospjelo”) and, for „time to invoice”, when
 * the last unloading was confirmed (vehicle stops; agency nalozi have none, so they never turn urgent).
 */
export interface InvoiceInfo {
  status: InvoiceStatus;
  /** Sent and past the due date. */
  isLate: boolean;
  daysPastDue?: number;
  dueDate?: Date;
  /** Invoiced on (Sent) / paid on (Paid). */
  updatedAt?: string;
  /** All cargo unloaded. */
  isUnloaded: boolean;
  unloadedAt?: string;
  unloadedDaysAgo?: number;
  /** The line under the badge. */
  detail: string;
  detailClass: string;
}

function lastUnloadingAt(shipment: Shipment) {
  const cargoIds = new Set(shipment.cargo.map((cargo) => cargo.id));
  return (shipment.vehicleStops ?? [])
    .filter((stop) => stop.unloadingCargos.some((cargo) => cargoIds.has(cargo.id)) && stop.completedAt)
    .map((stop) => stop.completedAt as string)
    .sort()
    .at(-1);
}

export function getInvoiceInfo(shipment: Shipment, client?: Pick<Client, 'termsOfPayment'>): InvoiceInfo {
  const status = shipment.invoiceStatus;
  const updatedAt = shipment.invoiceStatusUpdatedAt ?? undefined;

  if (status === InvoiceStatus.Paid) {
    return {
      status,
      isLate: false,
      updatedAt,
      isUnloaded: true,
      detail: updatedAt ? `plaćeno ${formatDateShort(updatedAt)}` : 'plaćeno',
      detailClass: STATUS_TEXT.success,
    };
  }

  if (status === InvoiceStatus.Sent) {
    const { dueDate } = getShipmentOverdueInfo({
      invoiceStatus: status,
      invoiceStatusUpdatedAt: shipment.invoiceStatusUpdatedAt,
      termsOfPayment: client?.termsOfPayment,
    });
    const daysToDue = dueDate ? daysFromToday(dueDate) : undefined;
    const isLate = !!shipment.isInvoiceOverdue || (daysToDue !== undefined && daysToDue < 0);
    const daysPastDue = isLate && daysToDue !== undefined && daysToDue < 0 ? -daysToDue : undefined;
    const base = { status, isLate, daysPastDue, dueDate: dueDate ?? undefined, updatedAt, isUnloaded: true };
    if (isLate)
      return { ...base, detail: daysPastDue ? `kasni ${daysPastDue} d` : 'kasni', detailClass: STATUS_TEXT.danger };
    if (daysToDue === 0) return { ...base, detail: 'dospijeva danas', detailClass: STATUS_TEXT.warning };
    if (dueDate) return { ...base, detail: `dospijeće ${formatDateShort(dueDate)}`, detailClass: STATUS_TEXT.muted };
    return {
      ...base,
      detail: updatedAt ? `fakturirano ${formatDateShort(updatedAt)}` : 'fakturirano',
      detailClass: STATUS_TEXT.muted,
    };
  }

  const isUnloaded =
    shipment.cargo.length > 0 && shipment.cargo.every((cargo) => cargo.loadStatus === LoadStatus.Unloaded);
  if (!isUnloaded) {
    return { status, isLate: false, isUnloaded, detail: 'nije istovareno', detailClass: STATUS_TEXT.muted };
  }
  const unloadedAt = lastUnloadingAt(shipment);
  const unloadedDaysAgo = unloadedAt ? -daysFromToday(unloadedAt) : undefined;
  const detail =
    unloadedDaysAgo === undefined
      ? 'istovareno'
      : unloadedDaysAgo <= 0
        ? 'istovareno danas'
        : unloadedDaysAgo === 1
          ? 'istovareno jučer'
          : `istovareno prije ${unloadedDaysAgo} d`;
  const isUrgent = (unloadedDaysAgo ?? 0) >= INVOICE_AFTER_DAYS;
  return {
    status,
    isLate: false,
    isUnloaded,
    unloadedAt,
    unloadedDaysAgo,
    detail,
    detailClass: isUrgent ? STATUS_TEXT.warning : STATUS_TEXT.muted,
  };
}

/** Lines for the invoice tooltip / panel: „Fakturirano 31.10.2026.”, „Valuta 30.11.2026.” … */
export function invoiceDateLines(info: InvoiceInfo) {
  return [
    info.unloadedAt && `Istovareno ${formatDate(info.unloadedAt)}`,
    info.status === InvoiceStatus.Sent && info.updatedAt && `Fakturirano ${formatDate(info.updatedAt)}`,
    info.dueDate && `Valuta ${formatDate(info.dueDate)}`,
    info.status === InvoiceStatus.Paid && info.updatedAt && `Plaćeno ${formatDate(info.updatedAt)}`,
  ].filter((line): line is string => !!line);
}
