import { backend } from '../services/backendService';
import {
  ClientAnalyticsItem,
  DriverAnalyticsItem,
  GetAnalyticsParams,
  GetShipmentAnalyticsParams,
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

export function getDriversAnalytics(params: GetAnalyticsParams) {
  return backend.get<DriverAnalyticsItem[]>('/api/analytics/drivers', { params });
}

export function getVehiclesAnalytics(params: GetAnalyticsParams) {
  return backend.get<VehicleAnalyticsItem[]>('/api/analytics/vehicles', { params });
}

export function getClientsAnalytics(params: GetAnalyticsParams) {
  return backend.get<ClientAnalyticsItem[]>('/api/analytics/clients', { params });
}
