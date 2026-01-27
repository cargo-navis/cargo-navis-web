import type { ChartData, ChartOptions } from 'chart.js';

import { ShipmentAnalytics, ShipmentPriceAnalytics } from '@/lib/api';
import { Box, ComboChart, FlexLayout, Icon, Text } from '@/ui';

interface TotalAnalyticsSectionProps {
  countData: ShipmentAnalytics;
  priceData: ShipmentPriceAnalytics;
}

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
      text: 'Ukupna analitika po periodu',
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
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
        text: 'Cijena (€)',
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

export const TotalAnalyticsSection = ({ countData, priceData }: TotalAnalyticsSectionProps) => {
  // Prepare combo chart data (bar + line)
  const chartData: ChartData<'bar' | 'line'> = {
    labels: countData.periods.map((period) => period.period),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Broj naloga',
        data: countData.periods.map((period) => period.count),
        backgroundColor: '#13949fad',
        borderColor: '#13949F',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'Cijena (€)',
        data: priceData.periods.map((period) => period.price),
        backgroundColor: '#3b82f6ad',
        borderColor: '#3b82f6',
        borderWidth: 2,
        tension: 0.4,
        yAxisID: 'y1',
      },
    ],
  };

  return (
    <FlexLayout className="flex-col gap-5">
      {/* Stats Cards */}
      <FlexLayout className="w-full gap-6">
        <FlexLayout className="flex-col flex-1 p-4 items-baseline justify-between  bg-white dark:bg-white-alpha-10 border border-dark-100 dark:border-light-900 shadow-sm rounded-m">
          <FlexLayout className="items-center gap-2 text-dark-600 dark:text-light-300">
            <Icon icon="DocumentTextIcon" size="l" />
            <Text color="text-color-3" variant="text-m-medium">
              Ukupan broj naloga
            </Text>
          </FlexLayout>
          <Text color="text-color-1" variant="text-xl-bold">
            {countData.total}
          </Text>
        </FlexLayout>
        <FlexLayout className="flex-col flex-1 p-4 items-baseline justify-between  bg-white dark:bg-white-alpha-10 border border-dark-100 dark:border-light-900 shadow-sm rounded-m">
          <FlexLayout className="items-center gap-2 text-dark-600 dark:text-light-300">
            <Icon icon="ChartBarIcon" size="l" />
            <Text color="text-color-3" variant="text-m-medium">
              Prosječan broj naloga
            </Text>
          </FlexLayout>
          <Text color="text-color-1" variant="text-xl-bold">
            {countData.average.toFixed(1)}{' '}
            <Text as="small" color="text-color-3" variant="text-m-medium">
              / mj.
            </Text>
          </Text>
        </FlexLayout>
        <FlexLayout className="flex-col flex-1 p-4 items-baseline justify-between  bg-white dark:bg-white-alpha-10 border border-dark-100 dark:border-light-900 shadow-sm rounded-m">
          <FlexLayout className="items-center gap-2 text-dark-600 dark:text-light-300">
            <Icon icon="CurrencyEuroIcon" size="l" />
            <Text color="text-color-3" variant="text-m-medium">
              Ukupna zarada
            </Text>
          </FlexLayout>
          <Text color="text-color-1" variant="text-xl-bold">
            {priceData.total.toLocaleString('hr-HR', { style: 'currency', currency: 'EUR' })}
          </Text>
        </FlexLayout>
        <FlexLayout className="flex-col flex-1 p-4 items-baseline justify-between  bg-white dark:bg-white-alpha-10 border border-dark-100 dark:border-light-900 shadow-sm rounded-m">
          <FlexLayout className="items-center gap-2 text-dark-600 dark:text-light-300">
            <Icon icon="ChartBarIcon" size="l" />
            <Text color="text-color-3" variant="text-m-medium">
              Prosječna zarada
            </Text>
          </FlexLayout>
          <Text color="text-color-1" variant="text-xl-bold">
            {priceData.average.toLocaleString('hr-HR', { style: 'currency', currency: 'EUR' })}{' '}
            <Text as="small" color="text-color-3" variant="text-m-medium">
              / mj.
            </Text>
          </Text>
        </FlexLayout>
      </FlexLayout>
      <Box className="box-content h-[400px] p-5 bg-white dark:bg-white-alpha-10 border border-dark-100 dark:border-light-900 shadow-sm rounded-m">
        <ComboChart data={chartData} options={chartOptions} />
      </Box>
    </FlexLayout>
  );
};
