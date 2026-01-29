import type { ChartData, ChartOptions } from 'chart.js';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

// Register Chart.js components for mixed chart types
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

interface ComboChartProps {
  data: ChartData<'bar' | 'line'>;
  options?: ChartOptions<'bar' | 'line'>;
}

export const ComboChart = ({ data, options }: ComboChartProps) => {
  return (
    <div className="flex-1 w-full h-full">
      <Chart data={data} options={options} type="bar" />
    </div>
  );
};
