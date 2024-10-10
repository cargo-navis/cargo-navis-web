import { alerts } from '@/lib/mocks/alerts';

export async function getAlerts() {
  return alerts;
  // return backend.get<Alert[]>('/api/alerts');
}
