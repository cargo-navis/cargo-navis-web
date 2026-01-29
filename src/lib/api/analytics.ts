import { backend } from '../services/backendService';
import {
  DriverAnalyticsItem,
  GetDriversAnalyticsParams,
  GetShipmentAnalyticsParams,
  GetVehiclesAnalyticsParams,
  ShipmentAnalytics,
  ShipmentPriceAnalytics,
  VehicleAnalyticsItem,
} from './analytics.d';

export function getShipmentAnalytics(params: GetShipmentAnalyticsParams) {
  return backend.get<ShipmentAnalytics>('/api/analytics/shipments/count', { params });
}

export function getShipmentPriceAnalytics(params: GetShipmentAnalyticsParams) {
  return backend.get<ShipmentPriceAnalytics>('/api/analytics/shipments/price', { params });
}

export function getDriversAnalytics(params: GetDriversAnalyticsParams) {
  return backend.get<DriverAnalyticsItem[]>('/api/analytics/drivers', { params });
}

export function getVehiclesAnalytics(params: GetVehiclesAnalyticsParams) {
  return backend.get<VehicleAnalyticsItem[]>('/api/analytics/vehicles', { params });
}
