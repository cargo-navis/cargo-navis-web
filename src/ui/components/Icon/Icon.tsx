import * as icons from '@tabler/icons-react';
import clsx from 'clsx';
import { forwardRef } from 'react';

import { Box, type BoxProps } from '@/ui';

import { type IconSize, iconSizesMap } from './const';

type IconKeys = Extract<keyof typeof icons, `Icon${string}`>;
export type IconType = Exclude<IconKeys, `${string}Filled`>;

const iconPixelSizes: Record<IconSize, number> = {
  xs: 12,
  s: 16,
  m: 20,
  l: 24,
  xl: 28,
  xxl: 32,
  xxxl: 36,
};

enum Icon2FillType {
  Solid = 'solid',
  Outline = 'outline',
}

type DefaultProps = Pick<BoxProps, 'onClick' | 'onBlur' | 'onKeyDown' | 'className' | 'isDisabled'>;

interface Icon2Props extends DefaultProps {
  className?: string;
  icon: IconType;
  size?: IconSize;
  color?: string;
  type?: `${Icon2FillType}`;
}

export const Icon = forwardRef<HTMLDivElement, Icon2Props>(
  ({ className, color, icon, size = 'm', type = 'outline', onClick, ...rest }, ref) => {
    const filledKey = `${icon}Filled` as IconKeys;
    const IconComponent = type === Icon2FillType.Solid && icons[filledKey] ? icons[filledKey] : icons[icon];

    return (
      <Box
        className={clsx(
          className,
          iconSizesMap[size],
          color,
          'flex-none focus:outline-blue-200 dark:focus:outline-orange-200 leading-[0px]'
        )}
        ref={ref}
        onClick={onClick}
        {...rest}
      >
        <IconComponent size={iconPixelSizes[size]} stroke={1.5} />
      </Box>
    );
  }
);

Icon.displayName = 'Icon';
