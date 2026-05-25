import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createShipment,
  deleteShipment,
  deleteShipmentFile,
  getShipment,
  getShipmentDocumentUrl,
  GetShipmentParams,
  getShipments,
  PaginatedResponse,
  Shipment,
  updateShipment,
  uploadShipmentFile,
} from '@/lib/api';

interface UseShipmentsArgs<T> {
  select?: (data: PaginatedResponse<Shipment>) => T;
  enabled?: boolean;
}

export function useShipments<TData = PaginatedResponse<Shipment>>(
  args?: UseShipmentsArgs<TData> & { params?: GetShipmentParams }
) {
  // Create a more specific query key that includes pagination parameters
  const createQueryKey = () => {
    if (!args?.params) return ['shipments'];

    const { page, size, sort, ...filters } = args.params;

    // Build query key with proper structure
    const queryKey: any[] = ['shipments'];

    // Add filters to query key if they exist
    if (Object.keys(filters).length > 0) {
      queryKey.push({ filters });
    }

    // Add pagination parameters if they exist
    if (page !== undefined || size !== undefined || sort) {
      queryKey.push({ pagination: { page, size, sort } });
    }

    return queryKey;
  };

  return useQuery({
    queryKey: createQueryKey(),
    queryFn: () => getShipments(args?.params),
    ...args,
    select: args?.select,
  });
}

/**
 * Possibly deprecate
 *
 * Convenience hook to get just the shipments array (for backward compatibility)
 * @param args - Arguments for the useShipments hook
 * @returns Shipments array
 */
export function useShipmentsData(args?: Omit<UseShipmentsArgs<Shipment[]>, 'select'> & { params?: GetShipmentParams }) {
  return useShipments({
    ...args,
    select: (data: PaginatedResponse<Shipment>) => data.data,
  });
}

export function useShipment(id?: string) {
  return useQuery({
    queryKey: ['shipment', id],
    queryFn: async () => getShipment(id as string),
    enabled: !!id,
  });
}

export function useGetShipmentDocumentUrl(shipmentId?: string) {
  return useMutation({
    mutationFn: async (params: { documentId: string; disposition: 'inline' | 'attachment' }) =>
      getShipmentDocumentUrl(shipmentId as string, params.documentId, params.disposition),
  });
}

function getShipmentsListPage(key: readonly unknown[]): number {
  for (const part of key) {
    if (part && typeof part === 'object' && 'pagination' in part) {
      return (part as { pagination?: { page?: number } }).pagination?.page ?? 1;
    }
  }
  return 1;
}

export function useCreateShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createShipment,
    onSuccess: () => {
      // The new shipment lands on page 1; any cached later page is now
      // shifted by one row, so drop them rather than serve stale order.
      queryClient.removeQueries({
        queryKey: ['shipments'],
        predicate: (q) => getShipmentsListPage(q.queryKey) > 1,
      });
      return queryClient.invalidateQueries({
        queryKey: ['shipments'],
        predicate: (q) => getShipmentsListPage(q.queryKey) === 1,
      });
    },
  });
}

export function useUpdateShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const { id, ...shipmentData } = data;
      return updateShipment(id, shipmentData);
    },
    onMutate: (data) => {
      const prevShipment = queryClient.getQueryData<Shipment>(['shipment', data.id]);

      queryClient.setQueryData(['shipment', data.id], (oldData: Shipment | undefined) => {
        if (!oldData) return oldData;
        return { ...oldData, ...data };
      });

      return { prevShipment };
    },
    onSuccess: (updated, variables) => {
      // The update response doesn't include vehicleStops, so we preserve
      // them from whatever we already had cached.
      queryClient.setQueryData<Shipment>(['shipment', variables.id], (prev) => ({
        ...prev,
        ...updated,
        vehicleStops: prev?.vehicleStops ?? updated.vehicleStops,
      }));

      queryClient.setQueriesData<PaginatedResponse<Shipment>>({ queryKey: ['shipments'] }, (data) => {
        if (!data?.data?.some((s) => s.id === variables.id)) return data;
        return {
          ...data,
          data: data.data.map((s) =>
            s.id === variables.id ? { ...s, ...updated, vehicleStops: s.vehicleStops ?? updated.vehicleStops } : s
          ),
        };
      });
    },
    onError: (_, data, context) => {
      if (!context) return;
      const { prevShipment } = context;

      queryClient.setQueryData(['shipment', data.id], prevShipment);
    },
  });
}

export function useDeleteShipment(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteShipment(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['shipment', id] });

      queryClient.setQueriesData<PaginatedResponse<Shipment>>({ queryKey: ['shipments'] }, (data) => {
        if (!data) return data;
        const filtered = data.data.filter((s) => s.id !== id);
        if (filtered.length === data.data.length) return data;
        return { ...data, data: filtered, totalElements: Math.max(0, data.totalElements - 1) };
      });
    },
  });
}

export function useSendShipmentToDriver(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { driverId: string; sentToDriver: boolean }) => Promise.resolve(data),
    // sendShipmentToDriver(id, data.driverId, data.sentToDriver),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      await queryClient.invalidateQueries({ queryKey: ['shipment', id] });
    },
  });
}

export function useUploadShipmentFile(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { file: File; fileName: string }) => uploadShipmentFile(id, params.file, params.fileName),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['shipment', id] });
    },
  });
}

export function useDeleteShipmentFile(shipmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) => deleteShipmentFile(shipmentId, documentId),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['shipment', shipmentId] });
    },
  });
}
