import type { Notification } from '@/lib/api/notifications.d';
import { backend } from '@/lib/services/backendService';

export async function getNotifications() {
  return backend.get<Notification[]>('/api/notifications');
}

export function readNotification(id: string) {
  return backend.post<void>(`/api/notifications/${id}/read`);
}

export function readAllNotifications() {
  return backend.post<void>('/api/notifications/read-all');
}

// Runtime enums live here, not in notifications.d.ts: Next 15+ (SWC) does not compile .d.ts files.
export enum NotificationType {
  SHIPMENT_STATUS_CHANGED = 'shipment_status_changed',
  SHIPMENT_MESSAGE_ACCEPTED = 'shipment_message_accepted',
  VEHICLE_STOP_COMPLETED = 'vehicle_stop_completed',
  SHIPMENT_DRAFT_UPDATED = 'shipment_draft_updated',
  VEHICLE_STOP_DOCUMENT_UPLOADED = 'vehicle_stop_document_uploaded',
}
