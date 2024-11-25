import clsx from 'clsx';

import { Box, Text } from '@/ui';

interface BadgeProps {
  text: number | string;
  isActive?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ text, isActive }) => {
  return (
    <Box
      className={clsx(
        'w-fit h-fit px-2 shrink-0 rounded-xs',
        isActive ? 'bg-white-alpha-50 dark:bg-orange-700' : 'bg-orange-50 dark:bg-orange-700',
      )}
    >
      <Text color="text-orange-450 dark:text-orange-100" variant="text-xxs-bold">
        {text}
      </Text>
    </Box>
  );
};
