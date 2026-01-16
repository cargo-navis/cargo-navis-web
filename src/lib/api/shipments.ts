import { backend } from '@/lib/services/backendService';

import type { CreateShipmentData, GetShipmentParams, Shipment } from './';
import type { PaginatedResponse } from './pagination.d';

export enum LoadStatus {
  NotYetLoaded = 'not_yet_loaded',
  Loaded = 'loaded',
  Unloaded = 'unloaded',
}

export enum InvoiceStatus {
  NotSent = 'not_sent',
  Sent = 'sent',
  Paid = 'paid',
}

export async function createShipment(data: CreateShipmentData) {
  return backend.post<Shipment>('/api/shipments', data);
}

export async function getShipments(params?: GetShipmentParams): Promise<PaginatedResponse<Shipment>> {
  const response = await backend.get<{ data: PaginatedResponse<Shipment> }>('/api/shipments', {
    params,
    fullResponse: true,
  });

  return response.data;
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

export async function sendShipmentToDriver(id: string, driverId: string, sentToDriver: boolean) {
  return updateShipment(id, { driverId, sentToDriver });
}

export async function uploadShipmentFile(id: string, file: File, fileName: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', fileName);

  return backend.post<Shipment>(`/api/shipments/${id}/files`, formData);
}

export async function getShipmentDocumentUrl(
  shipmentId: string,
  documentId: string,
  disposition: 'inline' | 'attachment' = 'attachment'
) {
  return backend.get<string>(`/api/shipments/${shipmentId}/files/${documentId}`, { params: { disposition } });
}

export async function deleteShipmentFile(shipmentId: string, documentId: string) {
  return backend.delete<void>(`/api/shipments/${shipmentId}/files/${documentId}`);
}
