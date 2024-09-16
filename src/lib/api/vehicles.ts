import { backend } from '@/lib/services/backendService';
import type { Vehicle } from './vehicles.d';

export async function getVehicles() {
  return backend.get<Vehicle[]>('/api/fleet');
}

export async function getVehicle(id: string) {
  // Get single vehicle
}
