import { backend } from '@/lib/services/backendService';
import type { CreateVehicleParams, UpdateVehicleParams, Vehicle } from './vehicles.d';

export async function getVehicles() {
  return backend.get<Vehicle[]>('/api/fleet');
}

export async function getVehicle(id: string) {
  // Get single vehicle
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
