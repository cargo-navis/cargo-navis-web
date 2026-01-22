export interface ShipmentAnalytics {
  total: number;
  granularity: 'day' | 'week' | 'month' | 'year';
  periods: {
    period: string;
    count: number;
  }[];
}

export interface ShipmentPriceAnalytics {
  total: number;
  granularity: 'day' | 'week' | 'month' | 'year';
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
