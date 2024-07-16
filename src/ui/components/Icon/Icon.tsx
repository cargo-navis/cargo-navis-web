import * as outlineIcons from '@heroicons/react/24/outline';
import * as solidIcons from '@heroicons/react/24/solid';

import { IconSize, iconSizesMap } from './const';
import { Box, BoxProps } from '@/ui';
import clsx from 'clsx';

export type IconType = keyof typeof outlineIcons & keyof typeof solidIcons;

enum IconFillType {
  Solid = 'solid',
  Outline = 'outline'
}

type DefaultProps = Pick<BoxProps, 'onClick' | 'onBlur' | 'onKeyDown' | 'className' | 'isDisabled'>;

interface IconProps extends DefaultProps{
  className?: string;
  icon: IconType;
  size?: IconSize;
  color?: string;
  type?: `${IconFillType}`;
}

export const Icon: React.FC<IconProps> = ({ className, color, icon, size = 'm', type = 'outline', onClick, ...rest }) => {
  const icons = type === IconFillType.Solid ? solidIcons : outlineIcons;
  const IconComponent = icons[icon];

  return (
    <Box
      className={clsx(
        className,
        iconSizesMap[size],
        color,
        'flex-none focus:outline-blue-200 dark:focus:outline-orange-200 leading-[0px]',
      )}
      onClick={onClick}
      {...rest}
    >
      <IconComponent />
    </Box>
  );
};