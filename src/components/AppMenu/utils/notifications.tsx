import { forwardRef } from 'react';

import { LoadStatus, type Notification, NotificationType } from '@/lib/api';
import { Text } from '@/ui';
import { MenuComponent } from '@/ui/components/Menu/types';

import { NotificationMenuItem } from '../NotificationMenuItem';
import { EmployeeNameById, ShipmentStatusPill } from './misc';

export function mapToNotificationMenuItems(notifications: Notification[]): MenuComponent[] {
  return notifications.map((n) => ({
    type: 'custom' as const,
    Renderer: forwardRef((props, ref) => <NotificationMenuItem notification={n} ref={ref} {...props} />),
    createdAt: n.createdAt,
  }));
}

export function getNotificationItemData(notification: Notification) {
  let targetUrl: string;
  let descriptionNode: React.ReactNode;

  const { type, metadata } = notification;

  switch (type) {
    case NotificationType.SHIPMENT_STATUS_CHANGED: {
      const { driverId, shipmentId, newStatus, orderNumber } = metadata;

      targetUrl = `/dashboard/shipments/${shipmentId}`;
      descriptionNode = (
        <Text color="text-color-2" variant="text-s">
          <EmployeeNameById id={driverId} /> je promijenio status naloga <strong>{orderNumber}</strong> u{' '}
          <ShipmentStatusPill status={newStatus as LoadStatus} />.
        </Text>
      );
      break;
    }
    case NotificationType.SHIPMENT_MESSAGE_ACCEPTED: {
      const { driverId, shipmentId, orderNumber } = metadata;

      targetUrl = `/dashboard/shipments/${shipmentId}`;
      descriptionNode = (
        <Text color="text-color-2" variant="text-s">
          <EmployeeNameById id={driverId} /> je primio obavijest o nalogu <strong>{orderNumber}</strong>.
        </Text>
      );
      break;
    }
    default: {
      // Handle non-existing case
      targetUrl = '';
      descriptionNode = null;
      break;
    }
  }

  return { targetUrl, descriptionNode };
}
