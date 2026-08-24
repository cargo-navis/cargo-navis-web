import type { ShipmentAnalytics, ShipmentPriceAnalytics } from '@/lib/api';

type CountPeriod = ShipmentAnalytics['periods'][number];
type PricePeriod = ShipmentPriceAnalytics['periods'][number];

/** Shipment count for a period, regular and agency combined. */
export const getShipmentCountForPeriod = (period: CountPeriod) => period.countRegular + period.countAgency;

/** Revenue for a period, regular and agency combined. Agency cost is not subtracted. */
export const getRevenueForPeriod = (period: PricePeriod) => period.revenueRegular + period.revenueAgency;

/** Agency margin (RUC) for a period: what was charged minus what the contractor was paid. */
export const getAgencyMarginForPeriod = (period: PricePeriod) => period.revenueAgency - period.costAgency;

export const getTotalShipmentCount = (data: ShipmentAnalytics) => data.totalRegular + data.totalAgency;

export const getAverageShipmentCount = (data: ShipmentAnalytics) => data.averageRegular + data.averageAgency;

export const getTotalRevenue = (data: ShipmentPriceAnalytics) => data.totalRevenueRegular + data.totalRevenueAgency;

export const getAverageRevenue = (data: ShipmentPriceAnalytics) =>
  data.averageRevenueRegular + data.averageRevenueAgency;

export const formatEur = (value: number) => value.toLocaleString('hr-HR', { style: 'currency', currency: 'EUR' });
