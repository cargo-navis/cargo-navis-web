import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createShipment, getShipments } from '@/lib/api';

export function useCreateShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createShipment,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['shipments'], type: 'all' });
    },
  });
}

export function useShipments() {
  return useQuery({
    queryKey: ['shipments'],
    queryFn: getShipments,
  });
}
