import type { NotificationType } from './notifications';
import { LoadStatus } from './shipments';

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
  shipmentId?: string;
  orderNumber?: string;
  driverId: string;
  driverName?: string;
  oldStatus?: LoadStatus;
  newStatus?: LoadStatus;
  vehicleStopId?: string;
  address?: string;
  shipments?: { shipmentId: string; orderNumber: string }[];
  draftId?: string;
  fileName?: string;
  documentId?: string;
  documentName?: string;
}
