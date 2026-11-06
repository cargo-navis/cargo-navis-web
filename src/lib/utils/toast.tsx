import { addToast } from '@heroui/react';
import React from 'react';

import { FlexLayout, Icon } from '@/ui';

interface ToastProps {
  title: string;
  description?: string;
  timeout?: number;
}

const successToastClassNames = {
  base: 'bg-teal-700 text-white border border-teal-600 max-w-[560px]',
  content: 'text-white',
  // Secondary line, smaller than the title. Arbitrary size on purpose: HeroUI's tailwind-merge does not know our
  // custom `text-xxs` and treats it as a colour, so it would be dropped.
  description: 'text-[13px] leading-[18px] text-white/90 whitespace-normal break-words',
  title: 'text-white whitespace-normal break-words',
  closeButton: 'hover:opacity-100 absolute right-3 top-1/2 -translate-y-1/2',
};

const successToastIcon = <Icon color="text-white" icon="IconInfoCircle" size="xl" />;

const successToastCloseIcon = (
  <FlexLayout className="bg-teal-700 p-1 items-center justify-center">
    <Icon color="text-white" icon="IconX" size="l" />
  </FlexLayout>
);

interface SuccessToastProps extends ToastProps {
  /** E.g. an undo button; replaces the close button. */
  endContent?: React.ReactNode;
  shouldShowTimeoutProgress?: boolean;
}

/** Returns the toast key, so callers can close it (e.g. from an action in `endContent`). */
export const showSuccessToast = ({
  title,
  description,
  timeout = 2500,
  endContent,
  shouldShowTimeoutProgress,
}: SuccessToastProps) => {
  return addToast({
    title,
    description,
    timeout,
    endContent,
    shouldShowTimeoutProgress,
    hideCloseButton: !!endContent,
    classNames: { ...successToastClassNames, progressIndicator: 'bg-white/70' },
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
      description: 'text-[13px] leading-[18px] text-white/90 whitespace-normal break-words',
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
