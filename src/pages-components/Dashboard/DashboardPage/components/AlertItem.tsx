import Link from 'next/link';
import type React from 'react';

import { getAlertItemData } from '@/components/AlertMenu/utils/alerts';
import type { Alert } from '@/lib/api';
import { Box, FlexLayout, Icon, Text } from '@/ui';

import { ruleToPropertyMap } from './utils';

interface AlertItemProps {
  alert: Alert;
}

export const AlertItem: React.FC<AlertItemProps> = ({ alert }) => {
  const { targetUrl, descriptionNode } = getAlertItemData(alert);

  const property = ruleToPropertyMap[alert.ruleName];
  const expiryDate = alert.alertable[property];

  const formattedDate = expiryDate
    ? new Intl.DateTimeFormat('hr-HR', { dateStyle: 'short' }).format(new Date(expiryDate))
    : '—';

  return (
    <Link
      className={`
      group 
      hover:bg-dark-50 hover:dark:bg-light-800
      focus:bg-dark-50 focus:dark:bg-light-800
    `}
      href={targetUrl}
    >
      <FlexLayout className="flex-start gap-3 p-4">
        <Icon className="mt-[1px]" color="text-red-500 dark:text-red-300" icon="ExclamationTriangleIcon" size="l" />
        <FlexLayout className="flex-col grow gap-1">
          {descriptionNode}
          <Text color="text-color-2" variant="text-s">
            Datum isteka:{' '}
            <Text color="text-color-1" variant="text-s-bold">
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
          <Icon color="text-color-2" icon="ArrowRightIcon" size="l" />
        </Box>
      </FlexLayout>
      <hr className="border-dark-300 dark:border-light-600 m-0" />
    </Link>
  );
};
