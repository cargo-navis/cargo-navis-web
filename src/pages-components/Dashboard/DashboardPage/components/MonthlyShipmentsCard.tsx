import 'dayjs/locale/hr';

import type { ChartData, ChartOptions } from 'chart.js';
import dayjs from 'dayjs';

import { useShipmentAnalytics, useShipmentPriceAnalytics } from '@/lib/hooks';
import { Box, ComboChart, FlexLayout, LoadingSpinner, Text } from '@/ui';

import { DashboardCard } from './DashboardCard';

dayjs.locale('hr');

const chartOptions: ChartOptions<'bar' | 'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: { legend: { position: 'bottom' } },
  scales: {
    x: { grid: { display: false }, ticks: { maxTicksLimit: 16, autoSkip: true, maxRotation: 0 } },
    y: {
      type: 'linear',
      position: 'left',
      beginAtZero: true,
      title: { display: true, text: 'Broj naloga' },
      ticks: { precision: 0 },
    },
    y1: {
      type: 'linear',
      position: 'right',
      beginAtZero: true,
      grid: { drawOnChartArea: false },
      title: { display: true, text: 'Prihod (€)' },
      ticks: { maxTicksLimit: 5 },
    },
  },
};

const formatEur = (value: number) => value.toLocaleString('hr-HR', { style: 'currency', currency: 'EUR' });

export const MonthlyShipmentsCard = () => {
  const start = dayjs().startOf('week');
  const end = dayjs().endOf('week');
  const from = start.format('YYYY-MM-DD');
  const to = end.format('YYYY-MM-DD');
  const params = { from, to, granularity: 'day' as const };

  const { data: countData, isLoading: isCountLoading } = useShipmentAnalytics(params);
  const { data: priceData, isLoading: isPriceLoading } = useShipmentPriceAnalytics(params);
  const isLoading = isCountLoading || isPriceLoading;

  const monthName = start.format('MMMM');
  const title = `Nalozi · ${monthName.charAt(0).toUpperCase()}${monthName.slice(1)}, ${start.format('D.')}-${end.format('D.')}`;

  const chartData: ChartData<'bar' | 'line'> = {
    labels: (countData?.periods ?? []).map((period) => dayjs(period.period).format('D.')),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Broj naloga',
        data: (countData?.periods ?? []).map((period) => period.count),
        backgroundColor: '#FFDDABad',
        borderColor: '#FFAA4D',
        borderWidth: 1,
        borderRadius: 4,
        yAxisID: 'y',
        order: 1,
      },
      {
        type: 'line' as const,
        label: 'Prihod (€)',
        data: (priceData?.periods ?? []).map((period) => period.price),
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
    <DashboardCard icon="IconChartBar" iconColor="text-teal-600" title={title}>
      {isLoading ? (
        <FlexLayout className="h-full items-center justify-center">
          <LoadingSpinner />
        </FlexLayout>
      ) : !countData || countData.periods.length === 0 ? (
        <FlexLayout className="h-full items-center justify-center">
          <Text color="text-color-3" variant="text-m">
            Nema podataka za ovaj mjesec
          </Text>
        </FlexLayout>
      ) : (
        <FlexLayout className="h-full flex-col gap-3">
          <FlexLayout className="h-1/4 gap-3 px-4">
            <FlexLayout className="flex-1 flex-col justify-center rounded-m bg-dark-25 p-4">
              <Text color="text-color-3" variant="text-xxs-medium">
                Nalozi
              </Text>
              <Text color="text-color-1" variant="text-l-bold">
                {countData.total}
              </Text>
            </FlexLayout>
            {priceData && (
              <FlexLayout className="flex-1 flex-col justify-center rounded-m bg-dark-25 p-4">
                <Text color="text-color-3" variant="text-xxs-medium">
                  Prihod
                </Text>
                <Text color="text-color-1" variant="text-l-bold">
                  {formatEur(priceData.total)}
                </Text>
              </FlexLayout>
            )}
          </FlexLayout>
          <Box className="h-3/4">
            <ComboChart data={chartData} options={chartOptions} />
          </Box>
        </FlexLayout>
      )}
    </DashboardCard>
  );
};
