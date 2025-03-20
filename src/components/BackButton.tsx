'use client';

import clsx from 'clsx';
import { useRouter } from 'next/navigation';

import { FlexLayout, Icon, Text } from '@/ui';

const canGoBackInHistory = (): boolean => {
  return typeof window !== 'undefined' && 'navigation' in window && !!(window as any).navigation?.canGoBack;
};

export function BackButton({ targetLocation }: { targetLocation: string }) {
  const { push, back } = useRouter();

  return (
    <FlexLayout
      className={clsx(
        'items-center gap-1 cursor-pointer max-w-max',
        'text-color-2 hover:text-teal-500 transition-colors duration-75'
      )}
      onClick={() => (canGoBackInHistory() ? back() : push(targetLocation))}
    >
      <Icon icon="ArrowUturnLeftIcon" />
      <Text variant="text-s-medium">Natrag</Text>
    </FlexLayout>
  );
}

// todo - ime firme utovara

// Todo - fixat removanje tereta
// todo - fixat editiranje naloga (http://localhost:3000/dashboard/shipments/c5202028-2064-4d67-841a-ffc77079c180/edit)
