import { addToast } from '@heroui/react';
import React from 'react';

import { FlexLayout, Icon, LoadingSpinner } from '@/ui';

interface ToastProps {
  title: string;
  description?: string;
  timeout?: number;
}

interface PromiseToastProps extends ToastProps {
  promise: Promise<unknown>;
  endContent?: React.ReactNode;
  shouldShowTimeoutProgress?: boolean;
}

const successToastClassNames = {
  base: 'bg-teal-700 text-white border border-teal-600 max-w-[560px]',
  content: 'text-white',
  description: 'text-white whitespace-normal break-words',
  title: 'text-white whitespace-normal break-words',
  closeButton: 'hover:opacity-100 absolute right-3 top-1/2 -translate-y-1/2',
};

const successToastIcon = <Icon color="text-white" icon="IconInfoCircle" size="xl" />;

const successToastCloseIcon = (
  <FlexLayout className="bg-teal-700 p-1 items-center justify-center">
    <Icon color="text-white" icon="IconX" size="l" />
  </FlexLayout>
);

export const showSuccessToast = ({ title, description, timeout = 2500 }: ToastProps) => {
  addToast({
    title,
    description,
    timeout,
    classNames: successToastClassNames,
    radius: 'sm',
    icon: successToastIcon,
    closeIcon: successToastCloseIcon,
  });
};

/**
 * Success-styled toast that shows a spinner until `promise` settles; the timeout starts after that.
 * Returns the toast key so callers can close it (e.g. when the promise fails).
 */
export const showPromiseToast = ({
  title,
  description,
  timeout = 2500,
  promise,
  endContent,
  shouldShowTimeoutProgress,
}: PromiseToastProps) => {
  return addToast({
    title,
    description,
    timeout,
    // HeroUI chains `.finally()` on the promise without a catch; hand it one that never rejects.
    promise: promise.catch(() => undefined),
    endContent,
    shouldShowTimeoutProgress,
    hideCloseButton: !!endContent,
    classNames: {
      ...successToastClassNames,
      progressIndicator: 'bg-white/70',
    },
    // HeroUI's default spinner relies on plugin animations we don't ship; use ours.
    loadingComponent: <LoadingSpinner color="text-white" size="m" />,
    radius: 'sm',
    icon: successToastIcon,
    closeIcon: successToastCloseIcon,
  });
};

export const showErrorToast = ({ title, description, timeout = 2500 }: ToastProps) => {
  addToast({
    title,
    description,
    classNames: {
      base: 'bg-red-600 dark:bg-red-700 text-white border border-red-600 max-w-[560px]',
      content: 'text-white',
      description: 'text-white whitespace-normal break-words',
      title: 'text-white whitespace-normal break-words',
      closeButton: 'hover:opacity-100 absolute right-3 top-1/2 -translate-y-1/2',
    },
    timeout,
    radius: 'sm',
    icon: <Icon color="text-white" icon="IconAlertTriangle" size="xl" />,
    closeIcon: (
      <FlexLayout className="bg-red-600 dark:bg-red-700 p-1 items-center justify-center">
        <Icon color="text-white" icon="IconX" size="l" />
      </FlexLayout>
    ),
  });
};
