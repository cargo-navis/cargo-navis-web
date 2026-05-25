import Link from 'next/link';
import React from 'react';

import type { Notification } from '@/lib/api';
import { FlexLayout, Icon } from '@/ui';

import { getNotificationItemData } from './utils/notifications';

interface NotificationMenuItemProps {
  notification: Notification;
}

export const NotificationMenuItem = React.forwardRef<any, NotificationMenuItemProps>(
  ({ notification, ...rest }, ref) => {
    const { targetUrl, descriptionNode } = getNotificationItemData(notification);

    const content = (
      <FlexLayout
        className="gap-2 px-4 py-2 hover:bg-dark-50 hover:dark:bg-light-800 data-[highlighted]:bg-dark-50 data-[highlighted]:dark:bg-light-800 outline-0"
        ref={ref}
        {...rest}
      >
        <Icon className="mt-[2px]" color="text-blue-500 dark:text-blue-300" icon="IconInfoCircle" />
        {descriptionNode}
      </FlexLayout>
    );

    return targetUrl ? <Link href={targetUrl}>{content}</Link> : content;
  }
);

NotificationMenuItem.displayName = 'NotificationMenuItem';
