import type { ChartData, ChartOptions } from 'chart.js';
import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartProps {
  data: ChartData<'bar'>;
  options?: ChartOptions<'bar'>;
}

export const BarChart = ({ data, options }: BarChartProps) => {
  return (
    <div className="flex-1 w-full h-full">
      <Bar data={data} options={options} />
    </div>
  );
};
