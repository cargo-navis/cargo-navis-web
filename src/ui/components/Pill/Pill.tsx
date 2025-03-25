import clsx from 'clsx';

import { Box, Text } from '@/ui';

import { getSizeStyles, type PillSize, type PillVariant, variantsMap } from './const';

interface PillProps {
  text: string;
  size?: PillSize;
  variant?: PillVariant;
}

export const Pill: React.FC<PillProps> = ({ text, size = 'm', variant = 'default' }) => {
  const { styles, textVariant } = getSizeStyles(size);

  return (
    <Box className={clsx('flex w-max items-center justify-center uppercase', styles, variantsMap[variant])}>
      <Text variant={textVariant}>{text}</Text>
    </Box>
  );
};
