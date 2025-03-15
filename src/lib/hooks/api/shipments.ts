import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createShipment, deleteShipment, getShipments, Shipment, updateShipment } from '@/lib/api';

interface UseShipmentsArgs<T> {
  select?: (data: Shipment[]) => T;
  enabled?: boolean;
}

export function useShipments<TData = Shipment[]>(args?: UseShipmentsArgs<TData>) {
  return useQuery({
    queryKey: ['shipments'],
    queryFn: getShipments,
    ...args,
    select: args?.select,
  });
}

export function useShipment(id: string) {
  return useShipments({
    enabled: !!id,
    select: (shipments) => {
      return shipments.find((c) => c.id.toString() === id);
    },
  });
}

// export function useShipment(id?: string) {
//   return useQuery({
//     queryKey: ['shipment', id],
//     queryFn: async () => {
//       if (!id) return null;
//       return getShipment(id);
//     },
//     enabled: !!id,
//   });
// }

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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shipment', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
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
