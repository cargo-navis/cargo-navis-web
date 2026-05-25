import { backend } from '@/lib/services/backendService';

import { AvailableCargosResponse, Cargo } from './shipments.d';

export function getCargos(shipmentId: string) {
  return backend.get<Cargo>(`/api/shipments/${shipmentId}/cargo`);
}

export function getAvailableCargos(vehicleStopId?: string) {
  return backend.get<AvailableCargosResponse>('/api/vehicle-stops/available-cargos', {
    params: vehicleStopId ? { vehicleStopId } : undefined,
  });
}

export function updateCargo(shipmentId: string, cargoId: string, data: any) {
  return backend.patch(`/api/shipments/${shipmentId}/cargo/${cargoId}`, data);
}
