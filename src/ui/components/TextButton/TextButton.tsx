import clsx from 'clsx';
import React, { memo } from 'react';

import { type BoxProps, DisplayIf, FlexLayout, Icon2, Icon2Type, Text } from '@/ui';

import { type Size, sizesMap, type Variant, variantsMap, variantStyles } from './const';

type DefaultProps = Pick<BoxProps, 'htmlFor' | 'onClick' | 'href' | 'target' | 'isDisabled' | 'type' | 'onKeyDown'>;

interface TextButtonProps extends DefaultProps {
  as?: 'button' | 'a';
  iconLeft?: Icon2Type;
  iconRight?: Icon2Type;
  variant?: Variant;
  size?: Size;
  text: string;
}

export const TextButton = memo(
  React.forwardRef<any, TextButtonProps>(
    ({ as = 'button', size = 'm', variant = 'primary', iconLeft, iconRight, text, isDisabled, ...rest }, ref) => {
      const { textVariant, iconSize, gap } = sizesMap[size];
      const styles = variantsMap[variant];

      const disabledAnchorStyles = as === 'a' && isDisabled && variantStyles[variant].disabledAnchor;

      return (
        <FlexLayout
          as={as}
          className={clsx(styles, disabledAnchorStyles, gap, 'w-max shrink-0 items-center focus:outline-none')}
          isDisabled={isDisabled}
          ref={ref}
          tabIndex={isDisabled ? -1 : 0}
          {...rest}
        >
          {!!iconLeft && <Icon2 icon={iconLeft} size={iconSize} />}
          <DisplayIf condition={!!text}>
            <Text variant={textVariant}>{text}</Text>
          </DisplayIf>
          {!!iconRight && <Icon2 icon={iconRight} size={iconSize} />}
        </FlexLayout>
      );
    }
  )
);

TextButton.displayName = 'TextButton';
