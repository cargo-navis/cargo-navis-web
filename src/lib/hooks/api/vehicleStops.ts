import { useQuery } from '@tanstack/react-query';

import { getVehicleStopsByVehicle, type VehicleStopGroup } from '@/lib/api/vehicleStops';

export function useVehicleStopsByVehicle() {
  return useQuery<VehicleStopGroup[]>({
    queryKey: ['vehicleStopsByVehicle'],
    queryFn: getVehicleStopsByVehicle,
  });
}
