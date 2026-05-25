import { addToast } from '@heroui/react';
import React from 'react';

import { FlexLayout, Icon } from '@/ui';

interface ToastProps {
  title: string;
  description?: string;
  timeout?: number;
}

export const showSuccessToast = ({ title, description, timeout = 2500 }: ToastProps) => {
  addToast({
    title,
    description,
    timeout,
    classNames: {
      base: 'bg-teal-700 text-white border border-teal-600',
      content: 'text-white',
      description: 'text-white',
      title: 'text-white',
      closeButton: 'hover:opacity-100 absolute right-3 top-1/2 -translate-y-1/2',
    },
    radius: 'sm',
    icon: <Icon color="text-white" icon="IconInfoCircle" size="xl" />,
    closeIcon: (
      <FlexLayout className="bg-teal-700 p-1 items-center justify-center">
        <Icon color="text-white" icon="IconX" size="l" />
      </FlexLayout>
    ),
  });
};

export const showErrorToast = ({ title, description, timeout = 2500 }: ToastProps) => {
  addToast({
    title,
    description,
    classNames: {
      base: 'bg-red-600 dark:bg-red-700 text-white border border-red-600',
      content: 'text-white',
      description: 'text-white',
      title: 'text-white',
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
