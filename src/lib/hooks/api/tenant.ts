import { getCurrentTenant } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export function useCurrentTenant() {
  return useQuery({
    queryKey: ['tenant'],
    queryFn: getCurrentTenant,
  });
}
