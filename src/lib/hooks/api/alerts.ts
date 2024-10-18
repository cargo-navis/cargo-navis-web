import { type Alert, getAlerts } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export function useAlerts<TData = Alert[]>() {
  return useQuery<Alert[], unknown, TData>({
    queryKey: ['alerts'],
    queryFn: getAlerts,
  });
}
