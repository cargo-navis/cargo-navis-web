import { backend } from '@/lib/services/backendService';

import type { ConvertToAgencyData, CreateAgencyShipmentData, UpdateAgencyShipmentData } from './agency-shipments.d';
import type { Shipment } from './shipments.d';

/**
 * Agency shipments are a parent/child pair behind a single id — the id of the
 * parent. Every endpoint here takes and returns that parent id; the child is
 * managed by the backend and only surfaces through the `contractor*` fields of
 * the returned shipment.
 *
 * Listing goes through `getShipments({ isAgency: true })` — there is no list
 * endpoint on this resource.
 */
export async function createAgencyShipment(data: CreateAgencyShipmentData) {
  return backend.post<Shipment>('/api/agency-shipments', data);
}

/** Throws 400 if the shipment is regular or `id` belongs to a child. */
export async function getAgencyShipment(id: string) {
  return backend.get<Shipment>(`/api/agency-shipments/${id}`);
}

export async function updateAgencyShipment(id: string, data: UpdateAgencyShipmentData) {
  return backend.patch<Shipment>(`/api/agency-shipments/${id}`, data);
}

/** Soft-deletes both the parent and the child. */
export async function deleteAgencyShipment(id: string) {
  return backend.delete<void>(`/api/agency-shipments/${id}`);
}

/** Creates a child carrying the same cargo. Throws 400 if already agency. */
export async function convertShipmentToAgency(id: string, data: ConvertToAgencyData) {
  return backend.post<Shipment>(`/api/shipments/${id}/convert-to-agency`, data);
}

/** Deletes the child; cargo stays on the parent. Throws 400 if already regular. */
export async function convertShipmentToRegular(id: string) {
  return backend.post<Shipment>(`/api/agency-shipments/${id}/convert-to-regular`);
}
