import { addToast } from '@heroui/react';
import React from 'react';

import { Icon } from '@/ui';
import { FlexLayout } from '@/ui';

interface ToastProps {
  title: string;
  description?: string;
}

export const showSuccessToast = ({ title, description }: ToastProps) => {
  addToast({
    title,
    description,
    timeout: 2500,
    classNames: {
      base: 'bg-teal-700 text-white border border-teal-600',
      content: 'text-white',
      description: 'text-white',
      title: 'text-white',
      closeButton: 'hover:opacity-100 absolute right-3 top-1/2 -translate-y-1/2',
    },
    radius: 'sm',
    icon: <Icon color="text-white" icon="InformationCircleIcon" size="xl" />,
    closeIcon: (
      <FlexLayout className="bg-teal-700 p-1 items-center justify-center">
        <Icon color="text-white" icon="XMarkIcon" size="l" />
      </FlexLayout>
    ),
  });
};

export const showErrorToast = ({ title, description }: ToastProps) => {
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
    timeout: 2500,
    radius: 'sm',
    icon: <Icon color="text-white" icon="ExclamationTriangleIcon" size="xl" />,
    closeIcon: (
      <FlexLayout className="bg-red-600 dark:bg-red-700 p-1 items-center justify-center">
        <Icon color="text-white" icon="XMarkIcon" size="l" />
      </FlexLayout>
    ),
  });
};
