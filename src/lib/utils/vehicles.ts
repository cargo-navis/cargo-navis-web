import { Vehicle, VehicleEnum } from '@/lib/api';

export const vehicleTypeToPathMap = {
  [VehicleEnum.TRUCK]: 'trucks',
  [VehicleEnum.TRAILER]: 'trailers',
  [VehicleEnum.SOLO_TRUCK]: 'solo-trucks',
  [VehicleEnum.VAN]: 'vans',
};

export function renderVehicleName(vehicle: Vehicle) {
  let vehicleName = vehicle.registration;
  if (vehicle.brand) vehicleName += ` (${vehicle.brand})`;
  return vehicleName;
}
