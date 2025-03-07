import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createShipment } from '@/lib/api';

export function useCreateShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createShipment,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['shipments'], type: 'all' });
    },
  });
}
