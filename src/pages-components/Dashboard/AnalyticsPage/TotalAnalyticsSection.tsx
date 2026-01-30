import 'dayjs/locale/hr';

import type { ChartData, ChartOptions } from 'chart.js';
import dayjs from 'dayjs';

import { ShipmentAnalytics, ShipmentPriceAnalytics } from '@/lib/api';
import { Box, ComboChart, FlexLayout, Icon, Text } from '@/ui';

import type { GranularityOption } from './GranularityFilter';

dayjs.locale('hr');

interface TotalAnalyticsSectionProps {
  countData: ShipmentAnalytics;
  priceData: ShipmentPriceAnalytics;
  granularity: GranularityOption;
}

const getGranularityLabel = (granularity: GranularityOption): string => {
  switch (granularity) {
    case 'day':
      return '/ dnevno';
    case 'week':
      return '/ tjedno';
    case 'month':
      return '/ mj.';
    case 'year':
      return '/ god.';
  }
};

const formatPeriodLabel = (period: string, granularity: GranularityOption): string => {
  switch (granularity) {
    case 'day':
      // Format: "2025-01-15" → "15. sij."
      return dayjs(period).format('D. MMM');
    case 'week':
      // Format: "2025-12-29 - 2026-01-04" → "29. pro. - 4. sij." or "1. - 7. sij." (same month)
      const weekMatch = period.match(/(\d{4}-\d{2}-\d{2}) - (\d{4}-\d{2}-\d{2})/);
      if (weekMatch) {
        const startDate = dayjs(weekMatch[1]);
        const endDate = dayjs(weekMatch[2]);
        const startDay = startDate.format('D');
        const endDay = endDate.format('D');
        const startMonth = startDate.format('MMM');
        const endMonth = endDate.format('MMM');
        const isSameMonth = startDate.month() === endDate.month() && startDate.year() === endDate.year();
        if (isSameMonth) {
          return `${startDay}. - ${endDay}. ${endMonth}`;
        }
        return `${startDay}. ${startMonth} - ${endDay}. ${endMonth}`;
      }
      return period;
    case 'month':
      // Format: "2025-01" → "Sij. 2025"
      return dayjs(period + '-01').format('M/YYYY');
    case 'year':
      // Format: "2025" → "2025"
      return period;
  }
};

const chartOptions: ChartOptions<'bar' | 'line'> = {
  elements: {
    line: {
      borderWidth: 10,
    },
  },
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'bottom',
    },
    title: {
      display: true,
      text: 'Broj naloga i zarada po periodu',
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        maxTicksLimit: 12,
        autoSkip: true,
        maxRotation: 45,
        minRotation: 0,
      },
    },
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      beginAtZero: true,
      title: {
        display: true,
        text: 'Broj naloga',
      },
      ticks: {
        stepSize: 1,
        maxTicksLimit: 8,
      },
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      beginAtZero: true,
      title: {
        display: true,
        text: 'Zarada (€)',
      },
      grid: {
        drawOnChartArea: false,
      },
      ticks: {
        maxTicksLimit: 8,
      },
    },
  },
};

export const TotalAnalyticsSection = ({ countData, priceData, granularity }: TotalAnalyticsSectionProps) => {
  const granularityLabel = getGranularityLabel(granularity);
  // Prepare combo chart data (bar + line)
  const chartData: ChartData<'bar' | 'line'> = {
    labels: countData.periods.map((period) => formatPeriodLabel(period.period, granularity)),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Broj naloga',
        data: countData.periods.map((period) => period.count),
        backgroundColor: '#FFDDABad',
        borderColor: '#FFAA4D',
        borderWidth: 1,
        yAxisID: 'y',
        order: 1,
      },
      {
        type: 'line' as const,
        label: 'Cijena (€)',
        data: priceData.periods.map((period) => period.price),
        backgroundColor: '#13949Fad',
        borderColor: '#13949F',
        borderWidth: 2,
        tension: 0.2,
        yAxisID: 'y1',
        order: 0,
      },
    ],
  };

  return (
    <FlexLayout className="flex-col gap-5">
      {/* Stats Cards */}
      <FlexLayout className="w-full gap-4">
        <FlexLayout className="flex-col flex-1 p-4 items-baseline justify-between  bg-white dark:bg-white-alpha-10 border border-dark-100 dark:border-light-900 shadow-md rounded-m">
          <FlexLayout className="items-center gap-2 text-dark-600 dark:text-light-300">
            <Icon icon="DocumentTextIcon" size="l" />
            <Text color="text-color-3" variant="text-m">
              Ukupan broj naloga
            </Text>
          </FlexLayout>
          <Text color="text-color-1" variant="text-xl-bold">
            {countData.total}
          </Text>
        </FlexLayout>
        <FlexLayout className="flex-col flex-1 p-4 items-baseline justify-between  bg-white dark:bg-white-alpha-10 border border-dark-100 dark:border-light-900 shadow-md rounded-m">
          <FlexLayout className="items-center gap-2 text-dark-600 dark:text-light-300">
            <Icon icon="ChartBarIcon" size="l" />
            <Text color="text-color-3" variant="text-m">
              Prosječan broj naloga
            </Text>
          </FlexLayout>
          <Text color="text-color-1" variant="text-xl-bold">
            {countData.average.toFixed(0)}{' '}
            <Text as="small" color="text-color-3" variant="text-m">
              {granularityLabel}
            </Text>
          </Text>
        </FlexLayout>
        <FlexLayout className="flex-col flex-1 p-4 items-baseline justify-between  bg-white dark:bg-white-alpha-10 border border-dark-100 dark:border-light-900 shadow-md rounded-m">
          <FlexLayout className="items-center gap-2 text-dark-600 dark:text-light-300">
            <Icon icon="BanknotesIcon" size="l" />
            <Text color="text-color-3" variant="text-m">
              Ukupna zarada
            </Text>
          </FlexLayout>
          <Text color="text-color-1" variant="text-xl-bold">
            {priceData.total.toLocaleString('hr-HR', { style: 'currency', currency: 'EUR' })}
          </Text>
        </FlexLayout>
        <FlexLayout className="flex-col flex-1 p-4 items-baseline justify-between  bg-white dark:bg-white-alpha-10 border border-dark-100 dark:border-light-900 shadow-md rounded-m">
          <FlexLayout className="items-center gap-2 text-dark-600 dark:text-light-300">
            <Icon icon="BanknotesIcon" size="l" />
            <Text color="text-color-3" variant="text-m">
              Prosječna zarada
            </Text>
          </FlexLayout>
          <Text color="text-color-1" variant="text-xl-bold">
            {priceData.average.toLocaleString('hr-HR', { style: 'currency', currency: 'EUR' })}{' '}
            <Text as="small" color="text-color-3" variant="text-m">
              {granularityLabel}
            </Text>
          </Text>
        </FlexLayout>
      </FlexLayout>
      <Box className="box-content h-[400px] p-5 bg-white dark:bg-white-alpha-10 border border-dark-100 dark:border-light-900 shadow-md rounded-m">
        <ComboChart data={chartData} options={chartOptions} />
      </Box>
    </FlexLayout>
  );
};
