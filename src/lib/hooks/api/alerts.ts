import { useQuery } from '@tanstack/react-query';

import { type Alert, getAlerts } from '@/lib/api';

interface UseAlertsArgs<T> {
  select?: (data: Alert[]) => T;
  enabled?: boolean;
}

export function useAlerts<TData = Alert[]>(args?: UseAlertsArgs<TData>) {
  return useQuery<Alert[], unknown, TData>({
    queryKey: ['alerts'],
    queryFn: getAlerts,
    ...args,
  });
}
