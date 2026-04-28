import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  assignShipmentToVehicle,
  createVehicleStop,
  deleteVehicleStop,
  deleteVehicleStopFile,
  getVehicleStop,
  getVehicleStopFileUrl,
  getVehicleStops,
  getVehicleStopsByVehicle,
  type GetVehicleStopsParams,
  sendVehicleStopMessage,
  updateVehicleStop,
  type UpdateVehicleStopParams,
  uploadVehicleStopFile,
  type VehicleStopGroup,
} from '@/lib/api/vehicleStops';

const QUERY_KEY = 'vehicleStops';

export function useVehicleStopsByVehicle(limit?: number) {
  return useQuery<VehicleStopGroup[]>({
    queryKey: [QUERY_KEY, 'byVehicle', limit],
    queryFn: () => getVehicleStopsByVehicle(limit),
  });
}

export function useVehicleStop(id?: string) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getVehicleStop(id as string),
    enabled: !!id,
  });
}

export function useVehicleStops(params: GetVehicleStopsParams) {
  return useQuery({
    queryKey: [QUERY_KEY, 'list', params],
    queryFn: () => getVehicleStops(params),
  });
}

export function useCreateVehicleStop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVehicleStop,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: [QUERY_KEY], type: 'all' });
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

export function useAssignShipmentToVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: assignShipmentToVehicle,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: [QUERY_KEY], type: 'all' });
    },
  });
}

export function useSendVehicleStopMessage(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => sendVehicleStopMessage(id),
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
