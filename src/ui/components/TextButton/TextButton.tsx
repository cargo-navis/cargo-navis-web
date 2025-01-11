import { type BoxProps, DisplayIf, FlexLayout, Icon, type IconType, Text } from '@/ui';
import clsx from 'clsx';
import React, { memo } from 'react';

import { type Size, type Variant, sizesMap, variantStyles, variantsMap } from './const';

type DefaultProps = Pick<BoxProps, 'htmlFor' | 'onClick' | 'href' | 'target' | 'isDisabled' | 'type' | 'onKeyDown'>;

interface TextButtonProps extends DefaultProps {
  as?: 'button' | 'a';
  iconLeft?: IconType;
  iconRight?: IconType;
  variant?: Variant;
  size?: Size;
  text: string;
}

export const TextButton = memo(
  React.forwardRef<any, TextButtonProps>(
    ({ as = 'button', size = 'm', variant = 'primary', iconLeft, iconRight, text, isDisabled, ...rest }, ref) => {
      const { textVariant, iconSize } = sizesMap[size];
      const styles = variantsMap[variant];

      const disabledAnchorStyles = as === 'a' && isDisabled && variantStyles[variant].disabledAnchor;

      return (
        <FlexLayout
          as={as}
          className={clsx(styles, disabledAnchorStyles, 'w-max shrink-0 items-center gap-2 focus:outline-none')}
          isDisabled={isDisabled}
          ref={ref}
          tabIndex={isDisabled ? -1 : 0}
          {...rest}
        >
          <DisplayIf condition={!!iconLeft}>
            <Icon icon={iconLeft as IconType} size={iconSize} />
          </DisplayIf>
          <DisplayIf condition={!!text}>
            <Text variant={textVariant}>{text}</Text>
          </DisplayIf>
          <DisplayIf condition={!!iconRight}>
            <Icon icon={iconRight as IconType} size={iconSize} />
          </DisplayIf>
        </FlexLayout>
      );
    },
  ),
);

TextButton.displayName = 'TextButton';
