import { backend } from '@/lib/services/backendService';

import { GetShipmentAnalyticsParams, ShipmentAnalytics, ShipmentPriceAnalytics } from './analytics.d';

export function getShipmentAnalytics(params: GetShipmentAnalyticsParams) {
  return backend.get<ShipmentAnalytics>('/api/analytics/shipments/count', { params });
}

export function getShipmentPriceAnalytics(params: GetShipmentAnalyticsParams) {
  return backend.get<ShipmentPriceAnalytics>('/api/analytics/shipments/price', { params });
}
