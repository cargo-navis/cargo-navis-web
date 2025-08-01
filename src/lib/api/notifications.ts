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
