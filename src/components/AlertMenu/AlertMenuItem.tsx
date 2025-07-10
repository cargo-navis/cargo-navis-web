import Link from 'next/link';
import React from 'react';

import type { Alert } from '@/lib/api';
import { FlexLayout, Icon } from '@/ui';

import { getAlertItemData } from './utils/alerts';

interface AlertMenuItemProps {
  alert: Alert;
}

export const AlertMenuItem = React.forwardRef<any, AlertMenuItemProps>(({ alert, ...rest }, ref) => {
  const { targetUrl, descriptionNode } = getAlertItemData(alert);

  return (
    <Link href={targetUrl}>
      <FlexLayout
        className="gap-2 px-4 py-2 hover:bg-dark-50 hover:dark:bg-light-800 data-[highlighted]:bg-dark-50 data-[highlighted]:dark:bg-light-800 outline-0"
        ref={ref}
        {...rest}
      >
        <Icon className="mt-1" color="text-red-500 dark:text-red-300" icon="ExclamationTriangleIcon" />
        {descriptionNode}
      </FlexLayout>
    </Link>
  );
});

AlertMenuItem.displayName = 'AlertMenuItem';
