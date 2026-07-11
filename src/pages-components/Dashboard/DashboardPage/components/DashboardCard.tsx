import { type ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { Box, FlexLayout, Icon, type IconType, Text } from '@/ui';

interface DashboardCardProps {
  title: string;
  icon?: IconType;
  headerRight?: ReactNode;
  children: ReactNode;
  className?: string;
}

// Shared shell for the dashboard grid: fixed height so the 2x2 layout stays
// aligned, a titled header, and a flex body that its content can scroll or fill.
export const DashboardCard = ({ title, icon, headerRight, children, className }: DashboardCardProps) => (
  <Box
    className={cn(
      'flex flex-col h-[440px] rounded-m border border-dark-200 dark:border-light-800 bg-white dark:bg-white-alpha-10 shadow-sm',
      className
    )}
  >
    <FlexLayout className="items-center justify-between gap-2 p-4 border-b border-dark-100 dark:border-light-900">
      <FlexLayout className="items-center gap-2 text-dark-600 dark:text-light-300">
        {icon && <Icon icon={icon} size="m" />}
        <Text variant="text-m-medium">{title}</Text>
      </FlexLayout>
      {headerRight}
    </FlexLayout>
    <Box className="flex-1 min-h-0 p-4">{children}</Box>
  </Box>
);
