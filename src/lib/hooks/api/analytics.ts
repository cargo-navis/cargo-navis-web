import { keepPreviousData, useQuery } from '@tanstack/react-query';

import {
  GetAnalyticsParams,
  getClientsAnalytics,
  getDriversAnalytics,
  getShipmentAnalytics,
  GetShipmentAnalyticsParams,
  getShipmentPriceAnalytics,
  getTransportContractorsAnalytics,
  getVehiclesAnalytics,
} from '@/lib/api';

interface AnalyticsQueryOptions {
  enabled?: boolean;
}

// Analitika keeps the previous numbers on screen (dimmed) while a filter change refetches (DECISIONS §2 Loading).

export function useShipmentAnalytics(params: GetShipmentAnalyticsParams, options?: AnalyticsQueryOptions) {
  return useQuery({
    queryKey: ['shipment-analytics', params],
    queryFn: () => getShipmentAnalytics(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useShipmentPriceAnalytics(params: GetShipmentAnalyticsParams, options?: AnalyticsQueryOptions) {
  return useQuery({
    queryKey: ['shipment-price-analytics', params],
    queryFn: () => getShipmentPriceAnalytics(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useDriversAnalytics(params: GetAnalyticsParams) {
  return useQuery({
    queryKey: ['drivers-analytics', params],
    queryFn: () => getDriversAnalytics(params),
    placeholderData: keepPreviousData,
  });
}

export function useVehiclesAnalytics(params: GetAnalyticsParams) {
  return useQuery({
    queryKey: ['vehicles-analytics', params],
    queryFn: () => getVehiclesAnalytics(params),
    placeholderData: keepPreviousData,
  });
}

export function useClientsAnalytics(params: GetAnalyticsParams) {
  return useQuery({
    queryKey: ['clients-analytics', params],
    queryFn: () => getClientsAnalytics(params),
    placeholderData: keepPreviousData,
  });
}

export function useTransportContractorsAnalytics(params: GetAnalyticsParams) {
  return useQuery({
    queryKey: ['transport-contractors-analytics', params],
    queryFn: () => getTransportContractorsAnalytics(params),
    placeholderData: keepPreviousData,
  });
}
