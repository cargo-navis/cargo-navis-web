import { type InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { PaginatedResponse } from '@/lib/api/pagination.d';
import {
  completeVehicleStop,
  createVehicleStops,
  deleteVehicleStop,
  deleteVehicleStopFile,
  getVehicleStop,
  getVehicleStopFileUrl,
  getVehicleStops,
  getVehicleStopsByVehicle,
  rearrangeVehicleStop,
  sendVehicleStopMessage,
  uncompleteVehicleStop,
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
    queryFn: ({ pageParam }) => getVehicleStops({ vehicleId, page: pageParam, size: VEHICLE_STOPS_PAGE_SIZE }),
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
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['shipment'], refetchType: 'all' });
      queryClient.invalidateQueries({ queryKey: ['shipments'], refetchType: 'all' });
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

export function useRearrangeVehicleStop(vehicleId: string) {
  const queryClient = useQueryClient();
  const queryKey = [QUERY_KEY, 'paginated', vehicleId];

  return useMutation({
    mutationFn: ({ stopId, previousStopId }: { stopId: string; previousStopId: string | null }) =>
      rearrangeVehicleStop(stopId, { previousStopId }),
    onMutate: ({ stopId, previousStopId }) => {
      const snapshot = queryClient.getQueriesData<InfiniteData<PaginatedResponse<VehicleStop>>>({ queryKey });

      queryClient.setQueriesData<InfiniteData<PaginatedResponse<VehicleStop>>>({ queryKey }, (old) => {
        if (!old) return old;
        const flat = old.pages.flatMap((p) => p.data);
        const moved = flat.find((s) => s.id === stopId);
        if (!moved) return old;
        const updated = { ...moved, previousStopId };
        const without = flat.filter((s) => s.id !== stopId);
        const anchorIndex = previousStopId ? without.findIndex((s) => s.id === previousStopId) : -1;
        const insertAt = previousStopId ? (anchorIndex === -1 ? without.length : anchorIndex) : without.length;
        const reordered = [...without.slice(0, insertAt), updated, ...without.slice(insertAt)];

        let cursor = 0;
        const pages = old.pages.map((p) => {
          const next = reordered.slice(cursor, cursor + p.data.length);
          cursor += p.data.length;
          return { ...p, data: next };
        });
        return { ...old, pages };
      });

      void queryClient.cancelQueries({ queryKey });
      return { snapshot };
    },
    onError: (_err, _vars, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSuccess: (updatedStop) => {
      queryClient.setQueriesData<InfiniteData<PaginatedResponse<VehicleStop>>>(
        { queryKey },
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

export function useDeleteVehicleStop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteVehicleStop(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: [QUERY_KEY], type: 'all' });
      return queryClient.invalidateQueries({ queryKey: ['shipment'], type: 'all' });
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
      queryClient.setQueriesData<VehicleStopGroup[]>({ queryKey: [QUERY_KEY, 'byVehicle'] }, (old) =>
        old?.map((group) =>
          group.vehicleId === updatedStop.vehicleId
            ? { ...group, stops: group.stops.map((s) => (s.id === updatedStop.id ? updatedStop : s)) }
            : group
        )
      );
    },
  });
}

export function useCompleteVehicleStop(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => completeVehicleStop(id),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: [QUERY_KEY], type: 'all' });
    },
  });
}

export function useUncompleteVehicleStop(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => uncompleteVehicleStop(id),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: [QUERY_KEY], type: 'all' });
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
