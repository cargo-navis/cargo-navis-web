import { InvoiceStatus } from '@/lib/api/shipments';

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
