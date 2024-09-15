import { type Vehicle, getVehicles } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export function useVehicles<TData = []>() {
  return useQuery<Vehicle[], unknown, TData>({
    queryKey: ['vehicles'],
    queryFn: getVehicles,
  });
}
