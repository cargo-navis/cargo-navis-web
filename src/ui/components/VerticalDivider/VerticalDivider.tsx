import clsx from 'clsx';

import { Box, FlexLayout } from '../';

interface VerticalDividerProps {
  bgColor?: string;
}

export const VerticalDivider: React.FC<VerticalDividerProps> = ({ bgColor = 'bg-dark-200 dark:bg-light-700' }) => (
  <FlexLayout className="relative isolate self-stretch shrink-0 justify-center items-center">
    <Box className={clsx('h-full w-[1px]', bgColor)} />
  </FlexLayout>
);
