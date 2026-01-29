export interface ShipmentAnalytics {
  total: number;
  granularity: 'day' | 'week' | 'month' | 'year';
  average: number;
  periods: {
    period: string;
    count: number;
  }[];
}

export interface ShipmentPriceAnalytics {
  total: number;
  granularity: 'day' | 'week' | 'month' | 'year';
  average: number;
  periods: {
    period: string;
    price: number;
  }[];
}

export interface GetShipmentAnalyticsParams {
  from: string;
  to: string;
  granularity: 'day' | 'week' | 'month' | 'year';
  driverId?: string;
  vehicleId?: string;
}

// Query params for driver/vehicle analytics endpoints
export interface GetDriversAnalyticsParams {
  from: string;
  to: string;
}

export interface GetVehiclesAnalyticsParams {
  from: string;
  to: string;
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
