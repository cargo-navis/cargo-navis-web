import { ClientSideOnly } from '@/lib/components/ClientSideOnly';
import { useShipmentAnalytics, useShipmentPriceAnalytics, useTransportContractorsAnalytics } from '@/lib/hooks/api';
import { formatEur, formatMarginShare, getAgencyMarginForPeriod } from '@/lib/utils/analytics';
import { FlexLayout } from '@/ui';
import { CHART_COLORS } from '@/ui/theme/chartColors';

import { AnalyticsChart, AnalyticsFilters, ContractorsTable, StatTile } from '../components';
import { ContentLoader } from '../ContentLoader';
import type { DateRange } from '../DateRangeFilter';
import type { GranularityOption } from '../GranularityFilter';
import { formatPeriodLabel } from '../utils';

interface AgencySectionProps {
  dateRange: DateRange;
  onDateRangeChange: (value: DateRange) => void;
  granularity: GranularityOption;
  onGranularityChange: (value: GranularityOption) => void;
}

/** Margin share appended to the RUC tile label: "RUC (17,1 %)". */
const getRucLabel = (margin: number, revenue: number) => {
  const share = formatMarginShare(margin, revenue);
  return share ? `RUC (${share})` : 'RUC';
};

export const AgencySection = ({
  dateRange,
  onDateRangeChange,
  granularity,
  onGranularityChange,
}: AgencySectionProps) => {
  const { from, to } = dateRange;
  const analyticsParams = { from, to, granularity };

  const { data: countData, isLoading: isCountLoading } = useShipmentAnalytics(analyticsParams);
  const { data: priceData, isLoading: isPriceLoading } = useShipmentPriceAnalytics(analyticsParams);
  const { data: contractorsData, isLoading: isContractorsLoading } = useTransportContractorsAnalytics({ from, to });

  const isLoading = isCountLoading || isPriceLoading || isContractorsLoading;
  const hasData = countData && priceData;

  const agencyMargin = priceData ? priceData.totalRevenueAgency - priceData.totalCostAgency : 0;

  return (
    <FlexLayout className="flex-col gap-5">
      <AnalyticsFilters
        dateRange={dateRange}
        granularity={granularity}
        onDateRangeChange={onDateRangeChange}
        onGranularityChange={onGranularityChange}
      />

      {isLoading || !hasData ? (
        <ClientSideOnly>
          <ContentLoader />
        </ClientSideOnly>
      ) : (
        <FlexLayout className="flex-col gap-5">
          <FlexLayout className="w-full gap-4">
            <StatTile icon="IconFileDescription" label="Broj agencijskih naloga" value={countData.totalAgency} />
            <StatTile icon="IconCashBanknote" label="Ukupni prihod" value={formatEur(priceData.totalRevenueAgency)} />
            <StatTile icon="IconCashBanknoteOff" label="Ukupni trošak" value={formatEur(priceData.totalCostAgency)} />
            <StatTile
              icon="IconTrendingUp"
              label={getRucLabel(agencyMargin, priceData.totalRevenueAgency)}
              value={formatEur(agencyMargin)}
            />
          </FlexLayout>

          <AnalyticsChart
            amountAxisLabel="Iznos (€)"
            datasets={[
              {
                type: 'bar' as const,
                label: 'Broj naloga',
                data: countData.periods.map((period) => period.countAgency),
                backgroundColor: CHART_COLORS.countAgency.fill,
                borderColor: CHART_COLORS.countAgency.border,
                borderWidth: 1,
                yAxisID: 'y',
                order: 3,
              },
              {
                type: 'line' as const,
                label: 'Prihod (€)',
                data: priceData.periods.map((period) => period.revenueAgency),
                backgroundColor: `${CHART_COLORS.revenue}ad`,
                borderColor: CHART_COLORS.revenue,
                borderWidth: 3,
                tension: 0.2,
                yAxisID: 'y1',
                order: 0,
              },
              {
                type: 'line' as const,
                label: 'Trošak (€)',
                data: priceData.periods.map((period) => period.costAgency),
                backgroundColor: `${CHART_COLORS.cost}ad`,
                borderColor: CHART_COLORS.cost,
                borderWidth: 3,
                tension: 0.2,
                yAxisID: 'y1',
                order: 1,
              },
              {
                type: 'line' as const,
                label: 'RUC (€)',
                data: priceData.periods.map(getAgencyMarginForPeriod),
                backgroundColor: `${CHART_COLORS.margin}ad`,
                borderColor: CHART_COLORS.margin,
                borderWidth: 3,
                borderDash: [6, 4],
                tension: 0.2,
                yAxisID: 'y1',
                order: 2,
              },
            ]}
            labels={countData.periods.map((period) => formatPeriodLabel(period.period, granularity))}
            title="Agencijski nalozi — broj, prihod, trošak i RUC po periodu"
          />

          <ContractorsTable data={contractorsData ?? []} />
        </FlexLayout>
      )}
    </FlexLayout>
  );
};
