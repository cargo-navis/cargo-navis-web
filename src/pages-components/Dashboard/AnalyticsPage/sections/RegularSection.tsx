import { useMemo, useState } from 'react';

import { ClientSideOnly } from '@/lib/components/ClientSideOnly';
import {
  useDriversAnalytics,
  useShipmentAnalytics,
  useShipmentPriceAnalytics,
  useVehiclesAnalytics,
} from '@/lib/hooks/api';
import { formatEur } from '@/lib/utils/analytics';
import { FlexLayout } from '@/ui';
import { CHART_COLORS } from '@/ui/theme/chartColors';

import { AnalyticsChart, AnalyticsFilters, DriversTable, StatTile, VehiclesTable } from '../components';
import { ContentLoader } from '../ContentLoader';
import type { DateRange } from '../DateRangeFilter';
import { DriverFilter } from '../DriverFilter';
import type { GranularityOption } from '../GranularityFilter';
import { formatPeriodLabel, getGranularityLabel, TOP_N } from '../utils';
import { VehicleFilter } from '../VehicleFilter';

interface RegularSectionProps {
  dateRange: DateRange;
  onDateRangeChange: (value: DateRange) => void;
  granularity: GranularityOption;
  onGranularityChange: (value: GranularityOption) => void;
}

export const RegularSection = ({
  dateRange,
  onDateRangeChange,
  granularity,
  onGranularityChange,
}: RegularSectionProps) => {
  const [selectedDriverId, setSelectedDriverId] = useState<string | undefined>(undefined);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>(undefined);

  const handleDriverChange = (value: string | undefined) => {
    setSelectedDriverId(value);
    if (value) setSelectedVehicleId(undefined);
  };

  const handleVehicleChange = (value: string | undefined) => {
    setSelectedVehicleId(value);
    if (value) setSelectedDriverId(undefined);
  };

  const { from, to } = dateRange;
  const analyticsParams = {
    from,
    to,
    granularity,
    driverId: selectedDriverId,
    vehicleId: selectedVehicleId,
  };

  const { data: countData, isLoading: isCountLoading } = useShipmentAnalytics(analyticsParams);
  const { data: priceData, isLoading: isPriceLoading } = useShipmentPriceAnalytics(analyticsParams);
  const { data: driversData, isLoading: isDriversLoading } = useDriversAnalytics({ from, to });
  const { data: vehiclesData, isLoading: isVehiclesLoading } = useVehiclesAnalytics({ from, to });

  const topDrivers = useMemo(
    () => [...(driversData ?? [])].sort((a, b) => b.totalPrice - a.totalPrice).slice(0, TOP_N),
    [driversData]
  );

  const topVehicles = useMemo(
    () => [...(vehiclesData ?? [])].sort((a, b) => b.totalPrice - a.totalPrice).slice(0, TOP_N),
    [vehiclesData]
  );

  const isLoading = isCountLoading || isPriceLoading || isDriversLoading || isVehiclesLoading;
  const hasData = countData && priceData;

  const granularityLabel = getGranularityLabel(granularity);

  return (
    <FlexLayout className="flex-col gap-5">
      <AnalyticsFilters
        dateRange={dateRange}
        granularity={granularity}
        onDateRangeChange={onDateRangeChange}
        onGranularityChange={onGranularityChange}
      >
        <DriverFilter isDisabled={!!selectedVehicleId} value={selectedDriverId} onChange={handleDriverChange} />
        <VehicleFilter isDisabled={!!selectedDriverId} value={selectedVehicleId} onChange={handleVehicleChange} />
      </AnalyticsFilters>

      {isLoading || !hasData ? (
        <ClientSideOnly>
          <ContentLoader />
        </ClientSideOnly>
      ) : (
        <FlexLayout className="flex-col gap-5">
          <FlexLayout className="w-full gap-4">
            <StatTile icon="IconFileDescription" label="Broj naloga" value={countData.totalRegular} />
            <StatTile
              hint={granularityLabel}
              icon="IconChartBar"
              label="Prosječan broj naloga"
              value={countData.averageRegular.toFixed(0)}
            />
            <StatTile icon="IconCashBanknote" label="Ukupni prihod" value={formatEur(priceData.totalRevenueRegular)} />
            <StatTile
              hint={granularityLabel}
              icon="IconCashBanknote"
              label="Prosječni prihod"
              value={formatEur(priceData.averageRevenueRegular)}
            />
          </FlexLayout>

          <AnalyticsChart
            amountAxisLabel="Prihod (€)"
            datasets={[
              {
                type: 'bar' as const,
                label: 'Broj naloga',
                data: countData.periods.map((period) => period.countRegular),
                backgroundColor: CHART_COLORS.countRegular.fill,
                borderColor: CHART_COLORS.countRegular.border,
                borderWidth: 1,
                yAxisID: 'y',
                order: 1,
              },
              {
                type: 'line' as const,
                label: 'Prihod (€)',
                data: priceData.periods.map((period) => period.revenueRegular),
                backgroundColor: `${CHART_COLORS.revenue}ad`,
                borderColor: CHART_COLORS.revenue,
                borderWidth: 3,
                tension: 0.2,
                yAxisID: 'y1',
                order: 0,
              },
            ]}
            labels={countData.periods.map((period) => formatPeriodLabel(period.period, granularity))}
            title="Vlastiti nalozi — broj i prihod po periodu"
          />

          <FlexLayout className="w-full gap-5">
            <DriversTable data={topDrivers} />
            <VehiclesTable data={topVehicles} />
          </FlexLayout>
        </FlexLayout>
      )}
    </FlexLayout>
  );
};
