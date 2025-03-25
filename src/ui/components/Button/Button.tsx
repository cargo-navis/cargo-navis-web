import clsx from 'clsx';
import type React from 'react';

import { DisplayIf, Icon, type IconType, LoadingSpinner, Text } from '@/ui';

import { Box, type BoxProps } from '../Box';
import { type Size, sizesMap, type Variant, variantsMap, variantStyles } from './const';

type DefaultProps = Pick<BoxProps, 'isDisabled' | 'onClick' | 'href' | 'target' | 'type'> &
  Pick<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'>;

export interface ButtonProps extends DefaultProps {
  as?: 'button' | 'a';
  isLoading?: boolean;
  isFullWidth?: boolean;
  iconLeft?: IconType;
  iconRight?: IconType;
  size?: Size;
  variant?: Variant;
  text?: string;
}

export const Button: React.FC<ButtonProps> = ({
  as = 'button',
  isDisabled = false,
  isLoading = false,
  isFullWidth = false,
  iconLeft,
  iconRight,
  size = 'm',
  variant = 'primary',
  text,
  ...rest
}) => {
  const { sizeStyles, textVariant, iconSize, loadingSize } = sizesMap[size];
  const styles = variantsMap[variant];

  const disabledAnchorStyles = as === 'a' && (isDisabled || isLoading) && variantStyles[variant].disabledAnchor;

  return (
    <Box
      as={as}
      className={clsx(
        'inline-block relative shrink-0 outline-none',
        sizeStyles,
        styles,
        disabledAnchorStyles,
        isFullWidth ? 'w-full' : 'w-fit'
      )}
      isDisabled={isDisabled || isLoading}
      tabIndex={isDisabled || isLoading ? -1 : 0}
      {...rest}
    >
      <DisplayIf condition={isLoading}>
        <Box className="flex items-center justify-center absolute top-0 bottom-0 left-0 right-0">
          <LoadingSpinner color="text-current-color" size={loadingSize} />
        </Box>
      </DisplayIf>
      <Box className={clsx('flex items-center justify-center gap-2', isLoading && 'invisible')}>
        <DisplayIf condition={!!iconLeft}>
          <Icon icon={iconLeft as IconType} size={iconSize} />
        </DisplayIf>
        <DisplayIf condition={!!text}>
          {/* Secondary button is our only ui/Button with border, so we need to reduce line height in favor of that. */}
          <Text className={variant === 'secondary' ? 'leading-[inherit]' : undefined} variant={textVariant}>
            {text}
          </Text>
        </DisplayIf>
        <DisplayIf condition={!!iconRight}>
          <Icon icon={iconRight as IconType} size={iconSize} />
        </DisplayIf>
      </Box>
    </Box>
  );
};
