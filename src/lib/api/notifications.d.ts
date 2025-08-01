import { LoadStatus } from './shipments';

export enum NotificationType {
  SHIPMENT_STATUS_CHANGED = 'shipment_status_changed',
  SHIPMENT_MESSAGE_ACCEPTED = 'shipment_message_accepted',
}

export interface Notification {
  id: string;
  type: NotificationType;
  isRead: boolean;
  metadata: Metadata;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationMetadata {
  type: NotificationType;
  shipmentId: string;
  orderNumber?: string;
  driverId: string;
  driverName?: string;
  oldStatus?: LoadStatus;
  newStatus?: LoadStatus;
}
