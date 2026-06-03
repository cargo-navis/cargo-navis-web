import clsx from 'clsx';

import { Box, Icon, type IconType, Text } from '@/ui';

import { getSizeStyles, type PillSize, type PillVariant, variantsMap } from './const';

interface PillProps {
  text?: string;
  icon?: IconType;
  size?: PillSize;
  variant?: PillVariant;
}

export const Pill: React.FC<PillProps> = ({ text, icon, size = 'm', variant = 'default' }) => {
  const { styles, textVariant, iconSize } = getSizeStyles(size);

  return (
    <Box
      className={clsx('flex w-max items-center justify-center gap-1 uppercase border', styles, variantsMap[variant])}
    >
      {icon && <Icon icon={icon} size={iconSize} />}
      {text && <Text variant={textVariant}>{text}</Text>}
    </Box>
  );
};
