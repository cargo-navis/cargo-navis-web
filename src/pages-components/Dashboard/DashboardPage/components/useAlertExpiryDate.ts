import { type Alert, AlertType, type Shipment } from '@/lib/api';
import { useClient } from '@/lib/hooks';
import { getShipmentOverdueInfo } from '@/lib/utils/shipments';

import { ruleToPropertyMap } from './utils';

export function useAlertExpiryDate(alert: Alert): string | null {
  const isInvoiceOverdue = alert.ruleName === AlertType.SHIPMENT_INVOICE_OVERDUE;
  const shipment = isInvoiceOverdue ? (alert.alertable as Shipment) : null;
  const { data: client } = useClient(shipment?.clientId || '');

  if (isInvoiceOverdue && client) {
    const { dueDate } = getShipmentOverdueInfo({
      invoiceStatus: shipment!.invoiceStatus,
      invoiceStatusUpdatedAt: shipment!.invoiceStatusUpdatedAt,
      termsOfPayment: client.termsOfPayment,
    });

    return dueDate?.toISOString().split('T')[0] ?? null;
  }

  const property = ruleToPropertyMap[alert.ruleName];
  return alert.alertable[property];
}
