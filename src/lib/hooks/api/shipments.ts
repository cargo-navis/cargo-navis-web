import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createShipment, deleteShipment, GetShipmentParams, getShipments, Shipment, updateShipment } from '@/lib/api';

interface UseShipmentsArgs<T> {
  select?: (data: Shipment[]) => T;
  enabled?: boolean;
}

export function useShipments<TData = Shipment[]>(args?: UseShipmentsArgs<TData> & { params?: GetShipmentParams }) {
  return useQuery({
    queryKey: ['shipments', args?.params],
    queryFn: () => getShipments(args?.params),
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
    onMutate: (data) => {
      const prevShipments = queryClient.getQueryData<Shipment[]>(['shipments']);
      const prevShipment = queryClient.getQueryData<Shipment>(['shipment', data.id]);

      queryClient.setQueryData(['shipments'], (oldData: Shipment[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map((shipment) => (shipment.id === data.id ? { ...shipment, ...data } : shipment));
      });

      return { prevShipments, prevShipment };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shipment', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
    onError: (_, data, context) => {
      if (!context) return;
      const { prevShipments, prevShipment } = context;

      queryClient.setQueryData(['shipments'], prevShipments);
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
