import Link from 'next/link';

import { getNotificationItemData } from '@/components/AppMenu/utils/notifications';
import { Notification } from '@/lib/api';
import { getDateTimeInLocalTimezone } from '@/lib/utils/date';
import { Box, FlexLayout, Icon2, Text } from '@/ui';

interface NotificationItemProps {
  notification: Notification;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { targetUrl, descriptionNode } = getNotificationItemData(notification);

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
        <Icon2 className="mt-[1px]" color="text-blue-500 dark:text-blue-300" icon="IconInfoCircle" size="l" />
        <FlexLayout className="flex-col grow gap-1">
          {descriptionNode}
          <Text color="text-color-3" variant="text-xxs">
            {getDateTimeInLocalTimezone(notification.createdAt)}
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
          <Icon2 color="text-color-2" icon="IconArrowRight" size="l" />
        </Box>
      </FlexLayout>
      <hr className="border-dark-300 dark:border-light-600 m-0" />
    </Link>
  );
};
