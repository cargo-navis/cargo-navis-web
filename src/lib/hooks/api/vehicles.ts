import {
  type UpdateVehicleParams,
  type Vehicle,
  VehicleEnum,
  createVehicle,
  deleteVehicle,
  getVehicles,
  updateVehicle,
} from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

interface UseVehicleArgs<T> {
  select?: (vehicles: Vehicle[]) => T;
  type?: VehicleEnum;
  enabled?: boolean;
}

export function useVehicles<TData = Vehicle[]>(args?: UseVehicleArgs<TData>) {
  return useQuery<Vehicle[], unknown, TData>({
    queryKey: ['vehicles'],
    queryFn: getVehicles,
    select: (vehicles) => {
      const filteredVehicles = args?.type ? vehicles.filter((v) => v.type === args.type) : vehicles;
      return args?.select ? args.select(filteredVehicles) : (filteredVehicles as unknown as TData);
    },
    ...args,
  });
}

export function useVehicle(id: string) {
  return useVehicles<Vehicle | undefined>({
    enabled: !!id,
    select: (vehicles) => {
      return vehicles.find((v) => v.id === id);
    },
  });
}

export function useTrucks() {
  const { data: trucks, ...rest } = useVehicles({ type: VehicleEnum.TRUCK });
  return { trucks, ...rest };
}

export function useTrailers() {
  const { data: trailers, ...rest } = useVehicles({ type: VehicleEnum.TRAILER });
  return { trailers, ...rest };
}

export function useSolos() {
  const { data: solos, ...rest } = useVehicles({ type: VehicleEnum.SOLO_TRUCK });
  return { solos, ...rest };
}

export function useVans() {
  const { data: vans, ...rest } = useVehicles({ type: VehicleEnum.VAN });
  return { vans, ...rest };
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVehicle,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['vehicles'], type: 'all' });
    },
  });
}

export function useUpdateVehicle(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateVehicleParams) => updateVehicle(id, data),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['vehicles'], type: 'all' });
    },
  });
}

export function useDeleteVehicle(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteVehicle(id),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['vehicles'], type: 'all' });
    },
  });
}
