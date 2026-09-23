import snakeCase from 'lodash/snakeCase';

import { InvoiceStatus } from '@/lib/api/shipments';
import type { ShipmentPdfLanguage } from '@/lib/api/shipments.d';

const MS_PER_DAY = 86_400_000;

interface OverdueCheckParams {
  invoiceStatus: InvoiceStatus;
  invoiceStatusUpdatedAt: string | null;
  termsOfPayment: string | number | undefined;
}

interface OverdueInfo {
  isOverdue: boolean;
  dueDate: Date | null;
  daysOverdue: number;
}

export function getShipmentOverdueInfo({
  invoiceStatus,
  invoiceStatusUpdatedAt,
  termsOfPayment,
}: OverdueCheckParams): OverdueInfo {
  if (invoiceStatus === InvoiceStatus.Paid || !invoiceStatusUpdatedAt || !termsOfPayment) {
    return { isOverdue: false, dueDate: null, daysOverdue: 0 };
  }

  const termsDays = Number(termsOfPayment);
  const dueDateMs = new Date(invoiceStatusUpdatedAt).getTime() + termsDays * MS_PER_DAY;
  const dueDate = new Date(dueDateMs);
  const daysOverdue = Math.floor((Date.now() - dueDateMs) / MS_PER_DAY);

  return {
    dueDate,
    isOverdue: Date.now() > dueDateMs,
    daysOverdue: Math.max(daysOverdue, 0),
  };
}

export const SHIPMENT_PDF_LANGUAGES: { value: ShipmentPdfLanguage; text: string; flagCode: string }[] = [
  { value: 'HR', text: 'Na hrvatskom', flagCode: 'HR' },
  { value: 'EN', text: 'Na engleskom', flagCode: 'GB' },
];

interface ShipmentPdfFilenameParams {
  shipmentId: string;
  orderNumber: string;
  recipientName?: string;
  language: ShipmentPdfLanguage;
}

export function buildShipmentPdfFilename({
  shipmentId,
  orderNumber,
  recipientName,
  language,
}: ShipmentPdfFilenameParams) {
  const slug = recipientName ? snakeCase(recipientName) : '';
  const suffix = language === 'EN' ? '-en' : '';

  if (!slug) return `shipment-${shipmentId}${suffix}.pdf`;

  return `${orderNumber}-${slug}-nalog${suffix}.pdf`;
}
