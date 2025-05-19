import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getCurrentTenant, updateTenant } from '@/lib/api';
import type { UpdateTenantParams } from '@/lib/api/tenant.d';

export function useCurrentTenant() {
  return useQuery({
    queryKey: ['tenant'],
    queryFn: getCurrentTenant,
  });
}

export const useUpdateTenant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTenantParams) => updateTenant(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tenant'] });
    },
  });
};
