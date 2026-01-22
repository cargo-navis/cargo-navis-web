import { useQuery } from '@tanstack/react-query';

import { getShipmentAnalytics, GetShipmentAnalyticsParams } from '@/lib/api';

export function useShipmentAnalytics(params: GetShipmentAnalyticsParams) {
  return useQuery({
    queryKey: ['shipment-analytics', params],
    queryFn: () => getShipmentAnalytics(params),
  });
}
