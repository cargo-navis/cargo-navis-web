import { useQuery } from '@tanstack/react-query';

import { getCurrentTenant } from '@/lib/api';

export function useCurrentTenant() {
  return useQuery({
    queryKey: ['tenant'],
    queryFn: getCurrentTenant,
  });
}
