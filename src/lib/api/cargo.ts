import { backend } from '@/lib/services/backendService';

import { Cargo } from './shipments.d';

export function getCargos(shipmentId: string) {
  return backend.get<Cargo>(`/api/shipments/${shipmentId}/cargo`);
}

export function updateCargo(shipmentId: string, cargoId: string, data: any) {
  return backend.patch(`/api/shipments/${shipmentId}/cargo/${cargoId}`, data);
}
