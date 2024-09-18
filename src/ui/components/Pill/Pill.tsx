import { Box, Text } from '@/ui';
import clsx from 'clsx';

import { type PillVariant, type PillSize, variantsMap, getSizeStyles } from './const';

interface PillProps {
  text: string;
  size?: PillSize;
  variant?: PillVariant;
}

export const Pill: React.FC<PillProps> = ({ text, size ='m', variant = 'default' }) => {
  const { styles, textVariant } = getSizeStyles(size);

  return (
    <Box
      className={clsx('flex w-max items-center justify-center uppercase', styles, variantsMap[variant])}
    >
      <Text variant={textVariant}>{text}</Text>
    </Box>
  );
};
