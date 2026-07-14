import clsx from 'clsx';
import type { ReactNode } from 'react';

import { FlexLayout, Icon, type IconType, Text } from '@/ui';

import { type AlertVariant, variantsMap } from './const';

interface AlertProps {
  text: ReactNode;
  icon?: IconType;
  variant?: AlertVariant;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ text, icon, variant = 'info', className }) => (
  <FlexLayout className={clsx('items-center gap-2 rounded-m px-4 py-3', variantsMap[variant], className)}>
    {icon && <Icon className="shrink-0" icon={icon} size="l" />}
    <Text className="text-inherit" variant="text-s">
      {text}
    </Text>
  </FlexLayout>
);
