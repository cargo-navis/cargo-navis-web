import { getItemData } from '@/components/AlertMenu/utils';
import type { Alert } from '@/lib/api';
import { FlexLayout, Icon, Text } from '@/ui';
import Link from 'next/link';
import type React from 'react';

interface AlertItemProps {
  alert: Alert;
}

export const AlertItem: React.FC<AlertItemProps> = ({ alert }) => {
  const { targetUrl, descriptionNode } = getItemData(alert);

  return (
    <Link href={targetUrl}>
    <FlexLayout className={`
      flex-start gap-3 p-4 
      hover:bg-dark-50 hover:dark:bg-light-800
      `}>
      <Icon icon="ExclamationTriangleIcon" size="l" color="text-red-500 dark:text-red-300" className="mt-1" />
      <FlexLayout className="flex-col gap-1">
        {descriptionNode}
        <Text>Datum isteka: 20.10.2025</Text>
      </FlexLayout>
    </FlexLayout>
      <hr className="border-dark-300 dark:border-light-600 m-0" />
    </Link>
  );
};
