import clsx from 'clsx';
import type { ReactNode } from 'react';

import { FlexLayout, Icon, type IconType, Text } from '@/ui';

import { type AlertSize, type AlertVariant, sizesMap, variantsMap } from './const';

interface AlertProps {
  text: ReactNode;
  title?: string;
  icon?: IconType;
  variant?: AlertVariant;
  size?: AlertSize;
  className?: string;
  /** Buttons the alert asks for, rendered below the text. */
  actions?: ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  text,
  title,
  icon,
  variant = 'info',
  size = 'm',
  className,
  actions,
}) => {
  const sizeStyles = sizesMap[size];

  return (
    <FlexLayout className={clsx('items-start', sizeStyles.container, variantsMap[variant], className)}>
      {icon && (
        <Icon
          className={clsx(
            'shrink-0',
            sizeStyles.iconOffset,
            // Original `m` behaviour, kept so existing alerts render unchanged.
            size === 'm' && !!text && !!title && 'mt-[2px]'
          )}
          icon={icon}
          size={sizeStyles.icon}
        />
      )}
      <FlexLayout className="flex-col gap-1">
        {title && (
          <Text className="text-inherit" variant={sizeStyles.title}>
            {title}
          </Text>
        )}
        <Text className="text-inherit" variant={sizeStyles.text}>
          {text}
        </Text>
        {!!actions && <FlexLayout className="items-center gap-3 mt-2">{actions}</FlexLayout>}
      </FlexLayout>
    </FlexLayout>
  );
};
