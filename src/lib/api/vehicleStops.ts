import { backend } from '@/lib/services/backendService';

import type { PaginatedResponse } from './pagination.d';
import type {
  CreateVehicleStopParams,
  GetVehicleStopsParams,
  UpdateVehicleStopParams,
  VehicleStop,
  VehicleStopDocument,
  VehicleStopGroup,
} from './vehicleStops.d';

export type {
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

export async function getVehicleStopsByVehicle(limitPerVehicle?: number, groupBy = 'vehicle') {
  const params = {};

  if (limitPerVehicle) params['limitPerVehicle'] = limitPerVehicle;
  if (groupBy) params['groupBy'] = groupBy;

  return backend.get<VehicleStopGroup[]>('/api/vehicle-stops', { params });
}

export async function getVehicleStops(params: GetVehicleStopsParams): Promise<PaginatedResponse<VehicleStop>> {
  const response = await backend.get<{ data: PaginatedResponse<VehicleStop> }>('/api/vehicle-stops', {
    params,
    fullResponse: true,
  });
  return response.data;
}

export async function createVehicleStops(data: CreateVehicleStopParams[]) {
  return backend.post<VehicleStop[]>('/api/vehicle-stops', data);
}

export async function assignShipmentToVehicle(data: { shipmentId: string; vehicleId: string }) {
  return backend.post<VehicleStop[]>('/api/vehicle-stops/assign-shipment', data);
}

export async function updateVehicleStop(id: string, data: UpdateVehicleStopParams) {
  return backend.patch<VehicleStop>(`/api/vehicle-stops/${id}`, data);
}

export async function rearrangeVehicleStop(id: string, data: { previousStopId: string | null }) {
  return backend.patch<VehicleStop>(`/api/vehicle-stops/${id}/rearrange`, data);
}

export async function deleteVehicleStop(id: string) {
  return backend.delete<void>(`/api/vehicle-stops/${id}`);
}

export async function sendVehicleStopMessage(id: string) {
  return backend.post<VehicleStop>(`/api/vehicle-stops/${id}/send-message`);
}

export async function completeVehicleStop(id: string) {
  return backend.post<VehicleStop>(`/api/vehicle-stops/${id}/complete`);
}

export async function uncompleteVehicleStop(id: string) {
  return backend.post<VehicleStop>(`/api/vehicle-stops/${id}/uncomplete`);
}

export async function uploadVehicleStopFile(id: string, file: File, fileName?: string) {
  const formData = new FormData();
  formData.append('file', file);
  return backend.post<VehicleStopDocument>(`/api/vehicle-stops/${id}/files`, formData, {
    params: fileName ? { filename: fileName } : undefined,
  });
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
