import { backend } from '@/lib/services/backendService';

import type { CreateShipmentData, Shipment } from './';

export async function createShipment(data: CreateShipmentData) {
  return backend.post<Shipment>('/api/shipments', data);
}

export async function getShipments() {
  const shipments = await backend.get<Shipment[]>('/api/shipments');
  return shipments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getShipment(id: string) {
  return backend.get<Shipment>(`/api/shipments/${id}`);
}

export async function updateShipment(id: string, data: Partial<CreateShipmentData>) {
  return backend.patch<Shipment>(`/api/shipments/${id}`, data);
}

export async function deleteShipment(id: string) {
  return backend.delete<void>(`/api/shipments/${id}`);
}
