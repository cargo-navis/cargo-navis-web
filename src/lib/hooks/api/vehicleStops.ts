import { type InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { PaginatedResponse } from '@/lib/api/pagination.d';
import {
  createVehicleStops,
  deleteVehicleStop,
  deleteVehicleStopFile,
  getVehicleStop,
  getVehicleStopFileUrl,
  getVehicleStops,
  getVehicleStopsByVehicle,
  sendVehicleStopMessage,
  updateVehicleStop,
  type UpdateVehicleStopParams,
  uploadVehicleStopFile,
  type VehicleStop,
  type VehicleStopGroup,
} from '@/lib/api/vehicleStops';

const QUERY_KEY = 'vehicleStops';
const VEHICLE_STOPS_PAGE_SIZE = 20;

export function useVehicleStopsByVehicle(limit?: number, options?: { enabled?: boolean }) {
  return useQuery<VehicleStopGroup[]>({
    queryKey: [QUERY_KEY, 'byVehicle', limit],
    queryFn: () => getVehicleStopsByVehicle(limit),
    enabled: options?.enabled ?? true,
  });
}

export function useVehicleStops(vehicleId: string) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEY, 'paginated', vehicleId],
    queryFn: ({ pageParam }) =>
      getVehicleStops({ vehicleId, page: pageParam, size: VEHICLE_STOPS_PAGE_SIZE, sort: 'desc' }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.currentPage < last.totalPages ? last.currentPage + 1 : undefined),
    enabled: !!vehicleId,
  });
}

export function useVehicleStop(id?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getVehicleStop(id as string),
    enabled: !!id,
  });
}

export function useCreateVehicleStops() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVehicleStops,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY], type: 'all' });
      queryClient.invalidateQueries({ queryKey: ['shipment'], type: 'all' });
      queryClient.invalidateQueries({ queryKey: ['shipments'], type: 'all' });
    },
  });
}

export function useUpdateVehicleStop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVehicleStopParams }) => updateVehicleStop(id, data),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: [QUERY_KEY], type: 'all' });
    },
  });
}

export function useDeleteVehicleStop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteVehicleStop(id),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: [QUERY_KEY], type: 'all' });
    },
  });
}

export function useSendVehicleStopMessage(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => sendVehicleStopMessage(id),
    onSuccess: (updatedStop) => {
      queryClient.setQueriesData<InfiniteData<PaginatedResponse<VehicleStop>>>(
        { queryKey: [QUERY_KEY, 'paginated', updatedStop.vehicleId] },
        (old) =>
          old && {
            ...old,
            pages: old.pages.map((p) => ({
              ...p,
              data: p.data.map((s) => (s.id === updatedStop.id ? updatedStop : s)),
            })),
          }
      );
    },
  });
}

export function useUploadVehicleStopFile(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: { file: File; fileName?: string }) => uploadVehicleStopFile(id, params.file, params.fileName),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: [QUERY_KEY], type: 'all' });
    },
  });
}

export function useDeleteVehicleStopFile(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => deleteVehicleStopFile(id, documentId),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: [QUERY_KEY], type: 'all' });
    },
  });
}

export function useGetVehicleStopFileUrl(id: string) {
  return useMutation({
    mutationFn: (params: { documentId: string; disposition: 'inline' | 'attachment' }) =>
      getVehicleStopFileUrl(id, params.documentId, params.disposition),
  });
}
