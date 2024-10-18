import Link from 'next/link';
import type React from 'react';

import { getItemData } from '@/components/AlertMenu/utils';
import type { Alert } from '@/lib/api';
import { Box, FlexLayout, Icon, Text } from '@/ui';

import { ruleToPropertyMap } from './utils';

interface AlertItemProps {
  alert: Alert;
}

export const AlertItem: React.FC<AlertItemProps> = ({ alert }) => {
  const { targetUrl, descriptionNode } = getItemData(alert);

  const property = ruleToPropertyMap[alert.ruleName];
  const expiryDate = alert.alertable[property];

  const formattedDate = expiryDate
    ? new Intl.DateTimeFormat('hr-HR', { dateStyle: 'short' }).format(new Date(expiryDate))
    : '—';

  return (
    <Link
      href={targetUrl}
      className={`
      group 
      hover:bg-dark-50 hover:dark:bg-light-800
      focus:bg-dark-50 focus:dark:bg-light-800
    `}
    >
      <FlexLayout className="flex-start gap-3 p-4">
        <Icon icon="ExclamationTriangleIcon" size="l" color="text-red-500 dark:text-red-300" className="mt-[1px]" />
        <FlexLayout className="flex-col grow gap-1">
          {descriptionNode}
          <Text color="text-color-2" variant="text-m">
            Datum isteka:{' '}
            <Text variant="text-m-bold" color="text-color-1">
              {formattedDate}
            </Text>
          </Text>
        </FlexLayout>
        <Box
          className={`
          self-center 
          opacity-0 translate-x-[-4px] 
          group-focus:translate-x-0 group-focus:opacity-100
          group-hover:translate-x-0 group-hover:opacity-100
          transition-transform`}
        >
          <Icon icon="ArrowRightIcon" size="l" color="text-color-2" />
        </Box>
      </FlexLayout>
      <hr className="border-dark-300 dark:border-light-600 m-0" />
    </Link>
  );
};
