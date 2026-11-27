import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getAvailableCargos, Shipment, updateCargo } from '@/lib/api';

export function useAvailableCargos(vehicleStopId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['available-cargos', vehicleStopId ?? null],
    queryFn: () => getAvailableCargos(vehicleStopId),
    enabled,
    staleTime: 0, // refetch each time the drawer reopens, ignoring the global 30s default
  });
}

export function useUpdateCargo(shipmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const { id, ...cargoData } = data;
      return updateCargo(shipmentId, id, cargoData);
    },
    onMutate: async (data) => {
      // Instant update of the nalog's cached entry: only the changed teret in its cargo list. (It used to write under
      // the teret's id — a key nothing reads — and would have turned the list into an object.)
      await queryClient.cancelQueries({ queryKey: ['shipment', shipmentId] });
      const prevShipment = queryClient.getQueryData<Shipment>(['shipment', shipmentId]);
      const { id, ...changes } = data;

      queryClient.setQueryData(['shipment', shipmentId], (shipment: Shipment | undefined) => {
        if (!shipment) return shipment;
        return {
          ...shipment,
          cargo: shipment.cargo.map((cargo) => (cargo.id === id ? { ...cargo, ...changes } : cargo)),
        };
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
