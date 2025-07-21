import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createShipment,
  deleteShipment,
  getShipment,
  GetShipmentParams,
  getShipments,
  Shipment,
  updateShipment,
} from '@/lib/api';

interface UseShipmentsArgs<T> {
  select?: (data: Shipment[]) => T;
  enabled?: boolean;
}

export function useShipments<TData = Shipment[]>(args?: UseShipmentsArgs<TData> & { params?: GetShipmentParams }) {
  return useQuery({
    queryKey: args?.params ? ['shipments', args.params] : ['shipments'],
    queryFn: () => getShipments(args?.params),
    ...args,
    select: args?.select,
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
