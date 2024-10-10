import { Alert } from '@/lib/api';
import { alerts } from '@/lib/mocks/alerts';
import { FlexLayout, Icon } from '@/ui';
import type { MenuComponent } from '@/ui/components/Menu/types';
import Link from 'next/link';
import React from 'react';

import { getItemData } from './utils';

interface AlertMenuItemProps {
  alert: Alert;
}

export const AlertMenuItem: React.FC<AlertMenuItemProps> = ({ alert }) => {
  const { targetUrl, descriptionNode } = getItemData(alert);

  return (
    <Link href={targetUrl}>
      <FlexLayout className="gap-2 px-4 py-2 hover:bg-dark-50 hover:dark:bg-light-800">
        <Icon icon="ExclamationTriangleIcon" color="text-red-500 dark:text-red-300" className="mt-1" />
        {descriptionNode}
      </FlexLayout>
    </Link>
  );
};

export const items: MenuComponent[] = [
  { type: 'custom', Renderer: <AlertMenuItem alert={alerts[0]} /> },
  { type: 'custom', Renderer: <AlertMenuItem alert={alerts[1]} /> },
  { type: 'custom', Renderer: <AlertMenuItem alert={alerts[2]} /> },
  { type: 'custom', Renderer: <AlertMenuItem alert={alerts[3]} /> },
  { type: 'custom', Renderer: <AlertMenuItem alert={alerts[4]} /> },
  { type: 'custom', Renderer: <AlertMenuItem alert={alerts[5]} /> },
  { type: 'custom', Renderer: <AlertMenuItem alert={alerts[6]} /> },
  { type: 'custom', Renderer: <AlertMenuItem alert={alerts[7]} /> },
  { type: 'custom', Renderer: <AlertMenuItem alert={alerts[8]} /> },
  { type: 'custom', Renderer: <AlertMenuItem alert={alerts[9]} /> },
  { type: 'item', text: 'Preview', iconLeft: 'EyeIcon', onClick: () => alert('Preview') },
  { type: 'item', text: 'Edit', iconLeft: 'PencilIcon', onClick: () => alert('Edit') },
];
