import { backend } from '@/lib/services/backendService';

import type { CreateVehicleParams, UpdateVehicleParams, Vehicle } from './vehicles.d';

export type { Vehicle };

export enum VehicleEnum {
  TRUCK = 'TRUCK',
  TRAILER = 'TRAILER',
  SOLO_TRUCK = 'SOLO_TRUCK',
  VAN = 'VAN',
}

export async function getVehicles() {
  return backend.get<Vehicle[]>('/api/fleet');
}

export async function getVehicle(id: string) {
  console.log(`GET VEHICLE ${id}`);
}

export async function createVehicle(data: CreateVehicleParams) {
  return backend.post<Vehicle>('/api/fleet', data);
}

export async function updateVehicle(id: string, data: UpdateVehicleParams) {
  return backend.patch<Vehicle>(`/api/fleet/${id}`, data);
}

export async function deleteVehicle(id: string) {
  return backend.delete<Vehicle>(`/api/fleet/${id}`);
}

export async function uploadVehicleFile(id: string, file: File, fileName: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', fileName);
  return backend.post<Vehicle>(`/api/fleet/${id}/files`, formData);
}

export async function getVehicleDocumentUrl(
  id: string,
  documentId: string,
  disposition: 'inline' | 'attachment' = 'attachment'
) {
  return backend.get<string>(`/api/fleet/${id}/files/${documentId}`, { params: { disposition } });
}

export async function deleteVehicleFile(id: string, documentId: string) {
  return backend.delete<void>(`/api/fleet/${id}/files/${documentId}`);
}
