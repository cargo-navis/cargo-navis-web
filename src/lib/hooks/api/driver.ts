import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  completeDriverStop,
  deleteDriverStopFile,
  getDriverAccount,
  getDriverStops,
  uncompleteDriverStop,
  uploadDriverStopFile,
} from '@/lib/api/driver';

const QUERY_KEY = 'driver';
const STOPS_QUERY_KEY = [QUERY_KEY, 'stops'];
const STOPS_REFETCH_INTERVAL = 60 * 1000;

export function useDriverAccount(options: { enabled: boolean }) {
  return useQuery({
    queryKey: [QUERY_KEY, 'account'],
    queryFn: getDriverAccount,
    enabled: options.enabled,
  });
}

// Both tabs read this one query; Nalozi derives shipments from it.
export function useDriverStops(options: { enabled: boolean }) {
  return useQuery({
    queryKey: STOPS_QUERY_KEY,
    queryFn: getDriverStops,
    enabled: options.enabled,
    refetchInterval: STOPS_REFETCH_INTERVAL,
  });
}

function useInvalidateDriverStops() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: STOPS_QUERY_KEY });
}

export function useCompleteDriverStop() {
  const invalidateStops = useInvalidateDriverStops();
  return useMutation({
    mutationFn: ({ stopId }: { stopId: string }) => completeDriverStop(stopId),
    onSuccess: invalidateStops,
  });
}

export function useUncompleteDriverStop() {
  const invalidateStops = useInvalidateDriverStops();
  return useMutation({
    mutationFn: ({ stopId }: { stopId: string }) => uncompleteDriverStop(stopId),
    onSuccess: invalidateStops,
  });
}

export function useUploadDriverStopFile() {
  const invalidateStops = useInvalidateDriverStops();
  return useMutation({
    mutationFn: ({ stopId, file, fileName }: { stopId: string; file: File; fileName?: string }) =>
      uploadDriverStopFile(stopId, file, fileName),
    onSuccess: invalidateStops,
  });
}

export function useDeleteDriverStopFile() {
  const invalidateStops = useInvalidateDriverStops();
  return useMutation({
    mutationFn: ({ stopId, documentId }: { stopId: string; documentId: string }) =>
      deleteDriverStopFile(stopId, documentId),
    onSuccess: invalidateStops,
  });
}
