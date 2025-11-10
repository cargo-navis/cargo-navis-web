import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateCargo } from '@/lib/api';

export function useUpdateCargo(shipmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const { id, ...cargoData } = data;
      return updateCargo(shipmentId, id, cargoData);
    },
    onMutate: (data) => {
      // const prevShipment = queryClient.getQueryData<Shipment>(['shipment', data.id]);
      //
      // queryClient.setQueryData(['shipment', data.id], (oldData: Shipment | undefined) => {
      //   if (!oldData) return oldData;
      //   return { ...oldData, ...data };
      // });
      //
      // return { prevShipment };
    },
    onSuccess: (_, variables) => {
      // queryClient.invalidateQueries({ queryKey: ['shipment', variables.id] });
      // queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
    onError: (_, data, context) => {
      // if (!context) return;
      // const { prevShipment } = context;
      //
      // queryClient.setQueryData(['shipment', data.id], prevShipment);
    },
  });
}
