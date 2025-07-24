import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createShipment,
  deleteShipment,
  getShipment,
  GetShipmentParams,
  getShipments,
  PaginatedResponse,
  Shipment,
  updateShipment,
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

    const { page, size, sort, sortDirection, ...filters } = args.params;

    // Build query key with proper structure
    const queryKey: any[] = ['shipments'];

    // Add filters to query key if they exist
    if (Object.keys(filters).length > 0) {
      queryKey.push({ filters });
    }

    // Add pagination parameters if they exist
    if (page !== undefined || size !== undefined || sort || sortDirection) {
      queryKey.push({ pagination: { page, size, sort, sortDirection } });
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

/**
 * Possibly deprecate
 *
 * Convenience hook to get pagination metadata
 * @param args - Arguments for the useShipments hook
 * @returns Pagination metadata
 */
export function useShipmentsPagination(
  args?: Omit<
    UseShipmentsArgs<{
      currentPage: number;
      pageSize: number;
      totalElements: number;
      totalPages: number;
    }>,
    'select'
  > & { params?: GetShipmentParams }
) {
  return useShipments({
    ...args,
    select: (data: PaginatedResponse<Shipment>) => ({
      currentPage: data.currentPage,
      pageSize: data.pageSize,
      totalElements: data.totalElements,
      totalPages: data.totalPages,
    }),
  });
}

export function useShipment(id?: string) {
  return useQuery({
    queryKey: ['shipment', id],
    queryFn: async () => getShipment(id as string),
    enabled: !!id,
  });
}

export function useCreateShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createShipment,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['shipments'], type: 'all' });
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shipment', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
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
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['shipment', id] });
    },
  });
}
