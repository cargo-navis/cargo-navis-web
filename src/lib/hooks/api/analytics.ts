import { useQuery } from '@tanstack/react-query';

import {
  getDriversAnalytics,
  GetDriversAnalyticsParams,
  getShipmentAnalytics,
  GetShipmentAnalyticsParams,
  getShipmentPriceAnalytics,
  getVehiclesAnalytics,
  GetVehiclesAnalyticsParams,
} from '@/lib/api';

export function useShipmentAnalytics(params: GetShipmentAnalyticsParams) {
  return useQuery({
    queryKey: ['shipment-analytics', params],
    queryFn: () => getShipmentAnalytics(params),
  });
}

export function useShipmentPriceAnalytics(params: GetShipmentAnalyticsParams) {
  return useQuery({
    queryKey: ['shipment-price-analytics', params],
    queryFn: () => getShipmentPriceAnalytics(params),
  });
}

export function useDriversAnalytics(params: GetDriversAnalyticsParams) {
  return useQuery({
    queryKey: ['drivers-analytics', params],
    queryFn: () => getDriversAnalytics(params),
  });
}

export function useVehiclesAnalytics(params: GetVehiclesAnalyticsParams) {
  return useQuery({
    queryKey: ['vehicles-analytics', params],
    queryFn: () => getVehiclesAnalytics(params),
  });
}
