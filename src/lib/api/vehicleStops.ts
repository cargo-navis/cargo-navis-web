import { backend } from '@/lib/services/backendService';

import type { PaginatedResponse } from './pagination.d';
import type {
  AssignShipmentToVehicleParams,
  CreateVehicleStopParams,
  GetVehicleStopsParams,
  UpdateVehicleStopParams,
  VehicleStop,
  VehicleStopDocument,
  VehicleStopGroup,
} from './vehicleStops.d';

export type {
  AssignShipmentToVehicleParams,
  CreateVehicleStopParams,
  GetVehicleStopsParams,
  UpdateVehicleStopParams,
  VehicleStop,
  VehicleStopAddress,
  VehicleStopAddressRequest,
  VehicleStopCargo,
  VehicleStopCargoMetadata,
  VehicleStopCargoShipment,
  VehicleStopDocument,
  VehicleStopGroup,
} from './vehicleStops.d';

export async function getVehicleStop(id: string) {
  return backend.get<VehicleStop>(`/api/vehicle-stops/${id}`);
}

export async function getVehicleStops(params: GetVehicleStopsParams) {
  return backend.get<PaginatedResponse<VehicleStop>>('/api/vehicle-stops', { params });
}

export async function getVehicleStopsByVehicle(limit?: number) {
  return backend.get<VehicleStopGroup[]>('/api/vehicle-stops/by-vehicle', {
    params: limit ? { limit } : undefined,
  });
}

export async function createVehicleStop(data: CreateVehicleStopParams) {
  return backend.post<VehicleStop>('/api/vehicle-stops', data);
}

export async function updateVehicleStop(id: string, data: UpdateVehicleStopParams) {
  return backend.patch<VehicleStop>(`/api/vehicle-stops/${id}`, data);
}

export async function deleteVehicleStop(id: string) {
  return backend.delete<void>(`/api/vehicle-stops/${id}`);
}

export async function assignShipmentToVehicle(data: AssignShipmentToVehicleParams) {
  return backend.post<void>('/api/vehicle-stops/assign-shipment', data);
}

export async function sendVehicleStopMessage(id: string) {
  return backend.post<VehicleStop>(`/api/vehicle-stops/${id}/send-message`);
}

export async function uploadVehicleStopFile(id: string, file: File, fileName?: string) {
  const formData = new FormData();
  formData.append('file', file);
  if (fileName) {
    formData.append('filename', fileName);
  }
  return backend.post<VehicleStopDocument>(`/api/vehicle-stops/${id}/files`, formData);
}

export async function deleteVehicleStopFile(id: string, documentId: string) {
  return backend.delete<void>(`/api/vehicle-stops/${id}/files/${documentId}`);
}

export async function getVehicleStopFileUrl(
  id: string,
  documentId: string,
  disposition: 'inline' | 'attachment' = 'attachment'
) {
  return backend.get<string>(`/api/vehicle-stops/${id}/files/${documentId}`, { params: { disposition } });
}
