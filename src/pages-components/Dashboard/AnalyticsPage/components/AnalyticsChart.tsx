import type { ChartData, ChartOptions } from 'chart.js';

import { Box, ComboChart } from '@/ui';

interface AnalyticsChartProps {
  title: string;
  labels: string[];
  datasets: ChartData<'bar' | 'line'>['datasets'];
  /** Right axis label, e.g. "Prihod (€)". */
  amountAxisLabel: string;
  /** Stack the bar datasets on the left axis. */
  isStacked?: boolean;
}

const getChartOptions = (title: string, amountAxisLabel: string, isStacked: boolean): ChartOptions<'bar' | 'line'> => ({
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
      text: title,
    },
  },
  scales: {
    x: {
      stacked: isStacked,
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
      stacked: isStacked,
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
        text: amountAxisLabel,
      },
      grid: {
        drawOnChartArea: false,
      },
      ticks: {
        maxTicksLimit: 8,
      },
    },
  },
});

export const AnalyticsChart = ({
  title,
  labels,
  datasets,
  amountAxisLabel,
  isStacked = false,
}: AnalyticsChartProps) => (
  <Box className="box-content h-[400px] p-5 bg-white dark:bg-white-alpha-10 border border-dark-100 dark:border-light-900 shadow-md rounded-m">
    <ComboChart data={{ labels, datasets }} options={getChartOptions(title, amountAxisLabel, isStacked)} />
  </Box>
);
