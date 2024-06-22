import { Box, Text } from '@/ui';

import { variantsMap } from './const';
import clsx from 'clsx';

interface PillProps {
  text: string;
  variant?: keyof typeof variantsMap;
}

export const Pill: React.FC<PillProps> = ({ text, variant = 'default' }) => {
  return (
    <Box className={clsx('flex items-center justify-center border-b-teal-400 bg-teal-100 w-min px-2 py-0.5 rounded-xl', variantsMap[variant])}>
      <Text>{text}</Text>
    </Box>
  );
};