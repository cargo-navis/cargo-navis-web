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
