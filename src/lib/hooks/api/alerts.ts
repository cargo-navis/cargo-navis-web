import { useQuery } from '@tanstack/react-query';

import { type Alert, getAlerts, type VehicleEnum } from '@/lib/api';

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
      return alerts.filter((a) => a.alertable.type === vehicleType);
    },
  });
}

export function useEmployeeAlerts() {
  return useAlerts({
    select: (alerts) => {
      return alerts.filter(({ alertable }) => {
        // TODO - weak logic decision
        return !!alertable.firstName;
      });
    },
  });
}
