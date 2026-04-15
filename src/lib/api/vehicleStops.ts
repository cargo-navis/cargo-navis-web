// import { backend } from '@/lib/services/backendService';

// import type { VehicleStopGroup } from './vehicleStops.d';
import { mockVehicleStopGroups } from './vehicleStops.mock';

export type { VehicleStop, VehicleStopAddress, VehicleStopGroup } from './vehicleStops.d';

export async function getVehicleStopsByVehicle() {
  // TODO: restore API call
  // return backend.get<VehicleStopGroup[]>('/api/vehicle-stops/by-vehicle', {
  //   params: { limit: 5 },
  // });
  return mockVehicleStopGroups;
}
