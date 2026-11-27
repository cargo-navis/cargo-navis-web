import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';

import { Badge, type BadgeTone } from '@/components/ui/badge';
import { LoadStatus, type Notification, NotificationType } from '@/lib/api';
import { useEmployee } from '@/lib/hooks/api/employees';

const LOAD_STATUS: Record<LoadStatus, { label: string; tone: BadgeTone }> = {
  [LoadStatus.NotYetLoaded]: { label: 'Nije utovareno', tone: 'neutral' },
  [LoadStatus.Loaded]: { label: 'Utovareno', tone: 'info' },
  [LoadStatus.Unloaded]: { label: 'Istovareno', tone: 'success' },
};

const Strong = ({ children }: { children: ReactNode }) => (
  <strong className="font-medium text-foreground">{children}</strong>
);

function DriverName({ id, fallback }: { id?: string; fallback?: string }) {
  const { data: employee } = useEmployee(id ?? '');
  const name = employee?.fullName || fallback;
  return name ? <Strong>{name}</Strong> : <>Vozač</>;
}

function StatusBadge({ status }: { status: LoadStatus }) {
  const config = LOAD_STATUS[status];
  if (!config) return <Strong>{status}</Strong>;
  return (
    <Badge className="align-middle" size="sm" tone={config.tone}>
      {config.label}
    </Badge>
  );
}

/**
 * Link target and one-sentence copy of a notification (inherits the surrounding text size; names and numbers in the
 * foreground colour). Used by the bell in the top bar and by the notifications card on Početna. Only rows without a
 * target link to shipments inside the text (no link inside a link).
 */
export function getNotificationItemData(notification: Notification) {
  let targetUrl = '';
  let descriptionNode: ReactNode = null;
  let avatarDriverId: string | undefined;

  const { type, metadata } = notification;

  switch (type) {
    case NotificationType.SHIPMENT_STATUS_CHANGED: {
      const { driverId, driverName, shipmentId, newStatus, orderNumber } = metadata;
      avatarDriverId = driverId;
      targetUrl = `/dashboard/shipments/${shipmentId}`;
      descriptionNode = (
        <>
          <DriverName fallback={driverName} id={driverId} /> je promijenio status naloga <Strong>{orderNumber}</Strong>{' '}
          u <StatusBadge status={newStatus as LoadStatus} />.
        </>
      );
      break;
    }
    case NotificationType.SHIPMENT_MESSAGE_ACCEPTED: {
      const { driverId, driverName, shipmentId, orderNumber } = metadata;
      avatarDriverId = driverId;
      targetUrl = `/dashboard/shipments/${shipmentId}`;
      descriptionNode = (
        <>
          <DriverName fallback={driverName} id={driverId} /> je primio obavijest o nalogu <Strong>{orderNumber}</Strong>
          .
        </>
      );
      break;
    }
    case NotificationType.SHIPMENT_DRAFT_UPDATED: {
      const { draftId, fileName } = metadata;
      targetUrl = `/dashboard/shipments?tab=drafts${draftId ? `&highlight=${draftId}` : ''}`;
      descriptionNode = (
        <>
          Nalog u pripremi <Strong>{fileName}</Strong> je ažuriran.
        </>
      );
      break;
    }
    case NotificationType.VEHICLE_STOP_COMPLETED: {
      const { driverId, driverName, address, shipments = [] } = metadata;
      avatarDriverId = driverId;
      descriptionNode = (
        <>
          <DriverName fallback={driverName} id={driverId} /> je obavio utovar / istovar na adresi{' '}
          <Strong>{address}</Strong> za {shipments.length === 1 ? 'nalog' : 'naloge'}{' '}
          {shipments.map((shipment, index) => (
            <Fragment key={shipment.shipmentId}>
              {index > 0 && (index === shipments.length - 1 ? ' i ' : ', ')}
              <Link
                className="font-medium text-brand hover:underline"
                href={`/dashboard/shipments/${shipment.shipmentId}`}
              >
                {shipment.orderNumber}
              </Link>
            </Fragment>
          ))}
          .
        </>
      );
      break;
    }
    case NotificationType.VEHICLE_STOP_DOCUMENT_UPLOADED: {
      const { driverId, driverName, documentName, address, vehicleStopId } = metadata;
      avatarDriverId = driverId;
      // Resolves the stop's vehicle and opens its route with the stop highlighted.
      targetUrl = `/dashboard/vehicle-stops/stop/${vehicleStopId}`;
      descriptionNode = (
        <>
          <DriverName fallback={driverName} id={driverId} /> je dodao dokument <Strong>{documentName}</Strong>
          {address ? (
            <>
              {' '}
              na adresi <Strong>{address}</Strong>
            </>
          ) : null}
          .
        </>
      );
      break;
    }
  }

  return { targetUrl, descriptionNode, driverId: avatarDriverId };
}
