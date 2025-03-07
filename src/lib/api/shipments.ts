import { backend } from '@/lib/services/backendService';

import type { CreateShipmentData } from './';

export async function createShipment(data: CreateShipmentData) {
  return backend.post<any>('/api/shipments', data);
}
