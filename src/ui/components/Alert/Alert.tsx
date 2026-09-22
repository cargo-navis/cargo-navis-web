import clsx from 'clsx';
import type { ReactNode } from 'react';

import { FlexLayout, Icon, type IconType, Text } from '@/ui';

import { type AlertVariant, variantsMap } from './const';

interface AlertProps {
  text: ReactNode;
  title?: string;
  icon?: IconType;
  variant?: AlertVariant;
  className?: string;
  /** Buttons the alert asks for, rendered below the text. */
  actions?: ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ text, title, icon, variant = 'info', className, actions }) => (
  <FlexLayout className={clsx('gap-2 rounded-m px-4 py-3', variantsMap[variant], className)}>
    {icon && <Icon className={clsx('shrink-0', !!text && !!title ? 'mt-[2px]' : '')} icon={icon} size="l" />}
    <FlexLayout className="flex-col gap-1">
      {title && (
        <Text className="text-inherit" variant="text-s-medium">
          {title}
        </Text>
      )}
      <Text className="text-inherit" variant="text-s">
        {text}
      </Text>
      {!!actions && <FlexLayout className="items-center gap-3 mt-2">{actions}</FlexLayout>}
    </FlexLayout>
  </FlexLayout>
);
