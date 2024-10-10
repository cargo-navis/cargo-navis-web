import { type Alert, type Employee, getAlerts } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

export function useAlerts<TData = Employee[]>() {
  return useQuery<Alert[], unknown, TData>({
    queryKey: ['employees'],
    queryFn: getAlerts,
  });
}
