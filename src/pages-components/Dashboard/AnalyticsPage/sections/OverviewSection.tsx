import { useMemo, useState } from 'react';

import { ClientSideOnly } from '@/lib/components/ClientSideOnly';
import { useClientsAnalytics, useShipmentAnalytics, useShipmentPriceAnalytics } from '@/lib/hooks/api';
import {
  formatEur,
  getAverageRevenue,
  getAverageShipmentCount,
  getRevenueForPeriod,
  getTotalRevenue,
  getTotalShipmentCount,
} from '@/lib/utils/analytics';
import { FlexLayout } from '@/ui';
import { CHART_COLORS } from '@/ui/theme/chartColors';

import { ClientFilter } from '../ClientFilter';
import { AnalyticsChart, AnalyticsFilters, ClientsTable, StatTile } from '../components';
import { ContentLoader } from '../ContentLoader';
import type { DateRange } from '../DateRangeFilter';
import type { GranularityOption } from '../GranularityFilter';
import { formatPeriodLabel, getGranularityLabel, TOP_N } from '../utils';

interface OverviewSectionProps {
  dateRange: DateRange;
  onDateRangeChange: (value: DateRange) => void;
  granularity: GranularityOption;
  onGranularityChange: (value: GranularityOption) => void;
}

export const OverviewSection = ({
  dateRange,
  onDateRangeChange,
  granularity,
  onGranularityChange,
}: OverviewSectionProps) => {
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);

  const { from, to } = dateRange;
  const analyticsParams = { from, to, granularity, clientId: selectedClientId };

  const { data: countData, isLoading: isCountLoading } = useShipmentAnalytics(analyticsParams);
  const { data: priceData, isLoading: isPriceLoading } = useShipmentPriceAnalytics(analyticsParams);
  const { data: clientsData, isLoading: isClientsLoading } = useClientsAnalytics({ from, to });

  const topClients = useMemo(
    () => [...(clientsData ?? [])].sort((a, b) => b.totalPrice - a.totalPrice).slice(0, TOP_N),
    [clientsData]
  );

  const isLoading = isCountLoading || isPriceLoading || isClientsLoading;
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
        <ClientFilter value={selectedClientId} onChange={setSelectedClientId} />
      </AnalyticsFilters>

      {isLoading || !hasData ? (
        <ClientSideOnly>
          <ContentLoader />
        </ClientSideOnly>
      ) : (
        <FlexLayout className="flex-col gap-5">
          <FlexLayout className="w-full gap-4">
            <StatTile
              icon="IconFileDescription"
              label="Ukupan broj naloga"
              note={`od toga ${countData.totalAgency} agencijskih`}
              value={getTotalShipmentCount(countData)}
            />
            <StatTile
              hint={granularityLabel}
              icon="IconChartBar"
              label="Prosječan broj naloga"
              note={`od toga ${countData.averageAgency.toFixed(0)} ${granularityLabel} agencijskih`}
              value={getAverageShipmentCount(countData).toFixed(0)}
            />
            <StatTile
              icon="IconCashBanknote"
              label="Ukupni prihod"
              note={`od toga ${formatEur(priceData.totalRevenueAgency)} agencijskih`}
              value={formatEur(getTotalRevenue(priceData))}
            />
            <StatTile
              hint={granularityLabel}
              icon="IconCashBanknote"
              label="Prosječni prihod"
              note={`od toga ${formatEur(priceData.averageRevenueAgency)} ${granularityLabel} agencijskih`}
              value={formatEur(getAverageRevenue(priceData))}
            />
          </FlexLayout>

          <AnalyticsChart
            amountAxisLabel="Prihod (€)"
            datasets={[
              {
                type: 'bar' as const,
                label: 'Vlastiti nalozi',
                data: countData.periods.map((period) => period.countRegular),
                backgroundColor: CHART_COLORS.countRegular.fill,
                borderColor: CHART_COLORS.countRegular.border,
                borderWidth: 1,
                stack: 'count',
                yAxisID: 'y',
                order: 1,
              },
              {
                type: 'bar' as const,
                label: 'Agencijski nalozi',
                data: countData.periods.map((period) => period.countAgency),
                backgroundColor: CHART_COLORS.countAgency.fill,
                borderColor: CHART_COLORS.countAgency.border,
                borderWidth: 1,
                stack: 'count',
                yAxisID: 'y',
                order: 1,
              },
              {
                type: 'line' as const,
                label: 'Ukupni prihod (€)',
                data: priceData.periods.map(getRevenueForPeriod),
                backgroundColor: `${CHART_COLORS.revenue}ad`,
                borderColor: CHART_COLORS.revenue,
                borderWidth: 3,
                tension: 0.2,
                yAxisID: 'y1',
                order: 0,
              },
            ]}
            isStacked
            labels={countData.periods.map((period) => formatPeriodLabel(period.period, granularity))}
            title="Broj naloga i prihod po periodu"
          />

          <ClientsTable data={topClients} />
        </FlexLayout>
      )}
    </FlexLayout>
  );
};
