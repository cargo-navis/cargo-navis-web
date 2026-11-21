import { Badge } from '@/components/ui/badge';
import { InvoiceStatus } from '@/lib/api/shipments';
import { cn } from '@/lib/utils';
import { Icon } from '@/ui';

/**
 * Invoice status pill (lab /tables invoice-cell.tsx „B, amber”, /partners): Nefakturiran amber (stronger amber + ⚠ once
 * unloaded ≥ 7 days ago = time to invoice), Fakturiran blue, „Kasni N d” red when payment is late, Plaćen green.
 * Red is reserved for late payment. Presentational: pass what the page knows (the API has `isInvoiceOverdue`, no
 * due date yet, so `daysPastDue` is optional).
 */

/** Not invoiced this many days after unloading = time to invoice. */
export const INVOICE_AFTER_DAYS = 7;

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  [InvoiceStatus.NotSent]: 'Nefakturiran',
  [InvoiceStatus.Sent]: 'Fakturiran',
  [InvoiceStatus.Paid]: 'Plaćen',
};

const URGENT =
  'border-amber-500 bg-amber-100 text-amber-900 dark:border-amber-600 dark:bg-amber-900 dark:text-amber-100';

export function InvoiceStatusBadge({
  status,
  isOverdue = false,
  daysPastDue,
  unloadedDaysAgo,
  size,
  className,
}: {
  status: InvoiceStatus;
  /** Sent and past the due date (`Shipment.isInvoiceOverdue`). */
  isOverdue?: boolean | null;
  /** Shows „Kasni N d” instead of „Kasni” when known. */
  daysPastDue?: number;
  /** Days since every cargo was unloaded (not invoiced yet); ≥ 7 turns the badge urgent. */
  unloadedDaysAgo?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  if (status === InvoiceStatus.Paid)
    return (
      <Badge className={className} size={size} tone="success">
        {INVOICE_STATUS_LABEL[status]}
      </Badge>
    );
  if (status === InvoiceStatus.Sent) {
    const late = !!isOverdue || (daysPastDue ?? 0) > 0;
    return (
      <Badge className={className} size={size} tone={late ? 'danger' : 'info'}>
        {late ? (daysPastDue ? `Kasni ${daysPastDue} d` : 'Kasni') : INVOICE_STATUS_LABEL[status]}
      </Badge>
    );
  }
  const urgent = (unloadedDaysAgo ?? 0) >= INVOICE_AFTER_DAYS;
  return (
    <Badge className={cn(urgent && URGENT, className)} size={size} tone="warning">
      {urgent && <Icon icon="IconAlertTriangle" size="xs" />}
      {INVOICE_STATUS_LABEL[status]}
    </Badge>
  );
}
