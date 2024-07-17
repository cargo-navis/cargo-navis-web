import clsx from 'clsx';

import { Box } from '../Box';
import LoadingSVG from './loading.svg';

const sizesMap = {
  s: 'w-[20px] h-[20px]',
  m: 'w-[24px] h-[24px]',
  l: 'w-[32px] h-[32px]',
  xl: 'w-[40px] h-[40px]',
};

interface LoadingSpinnerProps {
  color?: string;
  size?: keyof typeof sizesMap;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ color, size = 'm' }) => {
  return (
    <Box aria-busy className={clsx(sizesMap[size], color ?? 'text-blue-400 dark:text-orange-400')}>
      <LoadingSVG />
    </Box>
  );
};

export type LoadingSpinnerSize = keyof typeof sizesMap;
