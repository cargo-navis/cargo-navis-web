import 'dayjs/locale/hr';

import type { ChartData, ChartOptions } from 'chart.js';
import dayjs from 'dayjs';

import { ShipmentAnalytics, ShipmentPriceAnalytics } from '@/lib/api';
import { Box, ComboChart, FlexLayout, Icon2, Text } from '@/ui';

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
    case 'day': {
      // Format: "2025-01-15" → "15. sij." or "15. sij. 2024" if not current year
      const dayDate = dayjs(period);
      const isCurrentYear = dayDate.year() === dayjs().year();
      return isCurrentYear ? dayDate.format('D. MMM') : dayDate.format('D. MMM YYYY');
    }
    case 'week': {
      // Format: "2025-12-29 - 2026-01-04" → "29. pro. - 4. sij." or with years if not current year
      const weekMatch = period.match(/(\d{4}-\d{2}-\d{2}) - (\d{4}-\d{2}-\d{2})/);
      if (weekMatch) {
        const startDate = dayjs(weekMatch[1]);
        const endDate = dayjs(weekMatch[2]);
        const currentYear = dayjs().year();
        const startYear = startDate.year();
        const endYear = endDate.year();

        const startDay = startDate.format('D');
        const endDay = endDate.format('D');
        const startMonth = startDate.format('MMM');
        const endMonth = endDate.format('MMM');

        const isSameMonth = startDate.month() === endDate.month() && startYear === endYear;
        const bothInCurrentYear = startYear === currentYear && endYear === currentYear;
        const bothInSamePreviousYear = startYear === endYear && startYear !== currentYear;
        const spansDifferentYears = startYear !== endYear;

        if (bothInCurrentYear) {
          // No year needed
          if (isSameMonth) {
            return `${startDay}. - ${endDay}. ${endMonth}`;
          }
          return `${startDay}. ${startMonth} - ${endDay}. ${endMonth}`;
        } else if (bothInSamePreviousYear) {
          // Add year only to end date
          if (isSameMonth) {
            return `${startDay}. - ${endDay}. ${endMonth} ${endYear}`;
          }
          return `${startDay}. ${startMonth} - ${endDay}. ${endMonth} ${endYear}`;
        } else if (spansDifferentYears) {
          // Add year to both dates
          return `${startDay}. ${startMonth} ${startYear} - ${endDay}. ${endMonth} ${endYear}`;
        }
      }
      return period;
    }
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
      text: 'Broj naloga i prihod po periodu',
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
        text: 'Prihod (€)',
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
        label: 'Prihod (€)',
        data: priceData.periods.map((period) => period.price),
        backgroundColor: '#13949Fad',
        borderColor: '#13949F',
        borderWidth: 3,
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
            <Icon2 icon="IconFileDescription" size="l" />
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
            <Icon2 icon="IconChartBar" size="l" />
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
            <Icon2 icon="IconCashBanknote" size="l" />
            <Text color="text-color-3" variant="text-m">
              Ukupni prihod
            </Text>
          </FlexLayout>
          <Text color="text-color-1" variant="text-xl-bold">
            {priceData.total.toLocaleString('hr-HR', { style: 'currency', currency: 'EUR' })}
          </Text>
        </FlexLayout>
        <FlexLayout className="flex-col flex-1 p-4 items-baseline justify-between  bg-white dark:bg-white-alpha-10 border border-dark-100 dark:border-light-900 shadow-md rounded-m">
          <FlexLayout className="items-center gap-2 text-dark-600 dark:text-light-300">
            <Icon2 icon="IconCashBanknote" size="l" />
            <Text color="text-color-3" variant="text-m">
              Prosječni prihod
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
