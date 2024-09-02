import clsx from 'clsx';
import { Box, Text } from '@/ui';

import { variantsMap, PillVariant } from './const';

interface PillProps {
  text: string;
  variant?: PillVariant;
}

export const Pill: React.FC<PillProps> = ({ text, variant = 'default' }) => {
  return (
    <Box className={clsx('flex items-center justify-center w-min px-2 py-0.5 rounded-xl uppercase', variantsMap[variant])}>
      <Text variant="text-xs-medium">{text}</Text>
    </Box>
  );
};