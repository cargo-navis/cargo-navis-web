import { type Vehicle, VehicleEnum, getVehicles } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

interface UseVehicleArgs<T> {
  select?: (data: Vehicle[]) => T;
  enabled?: boolean;
}

export function useVehicles<TData = []>(args?: UseVehicleArgs<TData>) {
  return useQuery<Vehicle[], unknown, TData>({
    queryKey: ['vehicles'],
    queryFn: getVehicles,
    ...args,
  });
}

export function useVehicle(id: string) {
  return useVehicles({
    enabled: !!id,
    select: (vehicle) => {
      return vehicle.find((v) => v.id === id);
    },
  });
}

export function useTrucks() {
  const { data: trucks, ...rest } = useVehicles({
    select: (vehicles) => vehicles.filter((v) => v.type === VehicleEnum.TRUCK),
  });

  return { trucks, ...rest };
}
