import { backend } from '@/lib/services/backendService';

import type { CreateShipmentData, Shipment } from './';

export async function createShipment(data: CreateShipmentData) {
  return backend.post<Shipment>('/api/shipments', data);
}

export async function getShipments() {
  return backend.get<Shipment[]>('/api/shipments');
}
