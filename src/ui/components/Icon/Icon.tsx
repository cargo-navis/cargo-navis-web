import * as outlineIcons from '@heroicons/react/24/outline';
import * as solidIcons from '@heroicons/react/24/solid';

import { IconSize, iconSizesMap } from './const';
import { Box } from '@/ui';
import clsx from 'clsx';

export type IconType = keyof typeof outlineIcons & keyof typeof solidIcons;

interface IconProps {
  className?: string;
  icon: IconType;
  size?: IconSize;
  color?: string;
  type?: 'solid' | 'outline';
}

export const Icon: React.FC<IconProps> = ({ className, color, icon, size = 'm', type = 'outline' }) => {
  const icons = type === 'solid' ? solidIcons : outlineIcons;
  const IconComponent = icons[icon];

  return (
    <Box
      className={clsx(
        className,
        iconSizesMap[size],
        color,
        'flex-none focus:outline-blue-200 dark:focus:outline-orange-200 leading-[0px]',
      )}
    >
      <IconComponent />
    </Box>
  );
};