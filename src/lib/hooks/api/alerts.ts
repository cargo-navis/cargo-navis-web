import { type Alert, getAlerts, VehicleEnum } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

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

export function useAlertByVehicleType(vehicleType: VehicleEnum) {
  return useAlerts({
    select: (alerts) => {
      return alerts.filter(a => a.alertable.type === vehicleType);
    },
  });
}
