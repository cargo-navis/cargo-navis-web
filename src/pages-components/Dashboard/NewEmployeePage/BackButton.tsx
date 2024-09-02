'use client';

import { useRouter } from 'next/navigation';
import { Box, Icon, Text } from '@/ui';
import clsx from 'clsx';

export function BackButton() {
  const { back } = useRouter();

  return (
    <Box
      className={clsx(
        "flex items-center gap-1 cursor-pointer max-w-max",
        "text-color-2 hover:text-teal-500 transition-colors duration-75"
      )}
      onClick={back}
    >
      <Icon icon="ArrowUturnLeftIcon" />
      <Text variant="text-s-medium">Back</Text>
    </Box>
  );
}
