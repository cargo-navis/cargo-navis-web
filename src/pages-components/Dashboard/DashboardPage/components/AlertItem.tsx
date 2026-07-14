import Link from 'next/link';
import type React from 'react';

import { getAlertItemData } from '@/components/AppMenu/utils/alerts';
import type { Alert } from '@/lib/api';
import { Alert as AlertBar } from '@/ui';

import { useAlertExpiryDate } from './useAlertExpiryDate';

interface AlertItemProps {
  alert: Alert;
}

export const AlertItem: React.FC<AlertItemProps> = ({ alert }) => {
  const { targetUrl, plainNode, icon, variant: baseVariant } = getAlertItemData(alert);
  const expiryDate = useAlertExpiryDate(alert);

  const formattedDate = expiryDate
    ? new Intl.DateTimeFormat('hr-HR', { dateStyle: 'short' }).format(new Date(expiryDate))
    : '—';

  // Promote to danger once the expiry date has passed; otherwise keep the
  // per-type default (warning for everything but overdue invoices).
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const variant = expiryDate && new Date(expiryDate) <= today ? 'danger' : baseVariant;

  return (
    <Link className="group" href={targetUrl}>
      <AlertBar
        className="group-hover:underline"
        icon={icon}
        text={
          <>
            {plainNode} {formattedDate}
          </>
        }
        variant={variant}
      />
    </Link>
  );
};
