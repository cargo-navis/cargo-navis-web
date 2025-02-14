'use client';

import { FlexLayout, Icon, Text } from '@/ui';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';

export function BackButton({ targetLocation }: { targetLocation: string }) {
  const { push } = useRouter();

  return (
    <FlexLayout
      className={clsx(
        'items-center gap-1 cursor-pointer max-w-max',
        'text-color-2 hover:text-teal-500 transition-colors duration-75',
      )}
      onClick={() => push(targetLocation)}
    >
      <Icon icon="ArrowUturnLeftIcon" />
      <Text variant="text-s-medium">Natrag</Text>
    </FlexLayout>
  );
}
