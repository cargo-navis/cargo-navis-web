import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getAvailableCargos, Shipment, updateCargo } from '@/lib/api';

export function useAvailableCargos(vehicleStopId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['available-cargos', vehicleStopId ?? null],
    queryFn: () => getAvailableCargos(vehicleStopId),
    enabled,
  });
}

export function useUpdateCargo(shipmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const { id, ...cargoData } = data;
      return updateCargo(shipmentId, id, cargoData);
    },
    onMutate: (data) => {
      const prevShipment = queryClient.getQueryData<Shipment>(['shipment', shipmentId]);

      queryClient.setQueryData(['shipment', data.id], (shipment: Shipment | undefined) => {
        if (!shipment) return shipment;
        return { ...shipment, cargo: { ...shipment.cargo, ...data } };
      });

      return { prevShipment };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipment', shipmentId] });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
    onError: (_, _data, context) => {
      if (!context) return;
      queryClient.setQueryData(['shipment', shipmentId], context.prevShipment);
    },
  });
}
