import { useQuery } from '@tanstack/react-query';

import {
  GetAnalyticsParams,
  getClientsAnalytics,
  getDriversAnalytics,
  getShipmentAnalytics,
  GetShipmentAnalyticsParams,
  getShipmentPriceAnalytics,
  getVehiclesAnalytics,
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

export function useDriversAnalytics(params: GetAnalyticsParams) {
  return useQuery({
    queryKey: ['drivers-analytics', params],
    queryFn: () => getDriversAnalytics(params),
  });
}

export function useVehiclesAnalytics(params: GetAnalyticsParams) {
  return useQuery({
    queryKey: ['vehicles-analytics', params],
    queryFn: () => getVehiclesAnalytics(params),
  });
}

export function useClientsAnalytics(params: GetAnalyticsParams) {
  return useQuery({
    queryKey: ['clients-analytics', params],
    queryFn: () => getClientsAnalytics(params),
  });
}
