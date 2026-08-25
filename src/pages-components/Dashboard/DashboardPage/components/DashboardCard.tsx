import { type ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { Box, FlexLayout, Icon, type IconType, Text } from '@/ui';

interface DashboardCardProps {
  title: string;
  subtitle?: ReactNode;
  icon?: IconType;
  iconColor?: string;
  gradient?: string;
  headerRight?: ReactNode;
  children: ReactNode;
  className?: string;
}

// Shared shell for the dashboard grid: fixed height so the 2x2 layout stays
// aligned, a titled header, and a flex body that its content can scroll or fill.
export const DashboardCard = ({
  title,
  subtitle,
  icon,
  iconColor,
  gradient,
  headerRight,
  children,
  className,
}: DashboardCardProps) => (
  <Box
    className={cn(
      'flex flex-col h-[440px] rounded-m bg-white dark:bg-white-alpha-10 shadow-md',
      gradient && 'bg-gradient-to-tr',
      gradient,
      className
    )}
  >
    <FlexLayout className="items-center justify-between gap-2 p-4 border-b border-dark-100 dark:border-light-900">
      <FlexLayout className="gap-2 text-dark-600 dark:text-light-300">
        {icon && <Icon className="mt-1" color={iconColor} icon={icon} size="l" />}
        <FlexLayout className="flex-col">
          <Text color={iconColor ?? 'text-color-1'} variant="text-m-medium">
            {title}
          </Text>
          {subtitle}
        </FlexLayout>
      </FlexLayout>
      {headerRight}
    </FlexLayout>
    <Box className="flex-1 min-h-0 p-4">{children}</Box>
  </Box>
);
