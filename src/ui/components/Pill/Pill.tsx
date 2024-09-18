import { Box, Text } from '@/ui';
import clsx from 'clsx';

import { type PillVariant, variantsMap } from './const';

interface PillProps {
  text: string;
  variant?: PillVariant;
}

export const Pill: React.FC<PillProps> = ({ text, variant = 'default' }) => {
  return (
    <Box
      className={clsx('flex w-max items-center justify-center px-2 py-1 rounded-xl uppercase', variantsMap[variant])}
    >
      <Text variant="text-xs-medium">{text}</Text>
    </Box>
  );
};
