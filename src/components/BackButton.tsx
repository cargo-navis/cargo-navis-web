'use client';

import clsx from 'clsx';
import { useRouter } from 'next/navigation';

import { FlexLayout, Icon, Text } from '@/ui';

const canGoBackInHistory = (): boolean => {
  return typeof window !== 'undefined' && 'navigation' in window && !!(window as any).navigation?.canGoBack;
};

export function BackButton({ targetLocation, forceTarget }: { targetLocation: string; forceTarget?: boolean }) {
  const { push, back } = useRouter();

  return (
    <FlexLayout
      className={clsx(
        'items-center gap-1 cursor-pointer max-w-max',
        'text-color-2 hover:text-teal-500 transition-colors duration-75'
      )}
      onClick={() => (forceTarget || !canGoBackInHistory() ? push(targetLocation) : back())}
    >
      <Icon icon="IconArrowBackUp" />
      <Text variant="text-s-medium">Natrag</Text>
    </FlexLayout>
  );
}
