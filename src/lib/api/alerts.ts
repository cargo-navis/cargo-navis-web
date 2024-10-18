import type { Alert } from '@/lib/api/alerts.d';
import { backend } from '@/lib/services/backendService';

export async function getAlerts() {
  return backend.get<Alert[]>('/api/alerts');
}
