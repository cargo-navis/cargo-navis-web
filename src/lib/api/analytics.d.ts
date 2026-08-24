export type Granularity = 'day' | 'week' | 'month' | 'year';

export interface ShipmentAnalytics {
  totalRegular: number;
  totalAgency: number;
  averageRegular: number;
  averageAgency: number;
  granularity: Granularity;
  periods: {
    period: string;
    countRegular: number;
    countAgency: number;
  }[];
}

export interface ShipmentPriceAnalytics {
  totalRevenueRegular: number;
  totalRevenueAgency: number;
  totalCostAgency: number;
  averageRevenueRegular: number;
  averageRevenueAgency: number;
  averageCostAgency: number;
  granularity: Granularity;
  periods: {
    period: string;
    revenueRegular: number;
    revenueAgency: number;
    costAgency: number;
  }[];
}

export interface GetShipmentAnalyticsParams {
  from?: string;
  to?: string;
  granularity: Granularity;
  driverId?: string;
  vehicleId?: string;
  clientId?: string;
}

// Query params for driver/vehicle/client/transport-contractor analytics endpoints
export interface GetAnalyticsParams {
  from?: string;
  to?: string;
}

export interface DriverAnalyticsItem {
  driverId: string;
  shipmentCount: number;
  totalPrice: number;
}

export interface VehicleAnalyticsItem {
  vehicleId: string;
  shipmentCount: number;
  totalPrice: number;
}

export interface ClientAnalyticsItem {
  clientId: string;
  shipmentCount: number;
  totalPrice: number;
}

export interface TransportContractorAnalyticsItem {
  contractorId: string;
  shipmentCount: number;
  totalCost: number;
  totalRevenue: number;
  /** Difference between what was charged to the client and what was paid to the contractor. */
  margin: number;
}
