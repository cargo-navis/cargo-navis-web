import Link from 'next/link';

import { NotificationAvatar } from '@/components/AppMenu/utils/misc';
import { getNotificationItemData } from '@/components/AppMenu/utils/notifications';
import { Notification } from '@/lib/api';
import { getDateTimeInLocalTimezone } from '@/lib/utils/date';
import { Box, FlexLayout, Icon, Text } from '@/ui';

interface NotificationItemProps {
  notification: Notification;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { targetUrl, descriptionNode, driverId } = getNotificationItemData(notification);

  const content = (
    <>
      <FlexLayout className="flex-start gap-3 py-4">
        <NotificationAvatar driverId={driverId} />
        <FlexLayout className="flex-col grow gap-1">
          {descriptionNode}
          <Text color="text-color-3" variant="text-xxs">
            {getDateTimeInLocalTimezone(notification.createdAt)}
          </Text>
        </FlexLayout>
        {targetUrl && (
          <Box
            className={`
              self-center
              opacity-0 translate-x-[-4px]
              group-focus:translate-x-0 group-focus:opacity-100
              group-hover:translate-x-0 group-hover:opacity-100
              transition-transform`}
          >
            <Icon color="text-color-2" icon="IconArrowRight" size="l" />
          </Box>
        )}
      </FlexLayout>
      <hr className="border-dark-100 dark:border-light-800 m-0" />
    </>
  );

  if (!targetUrl) {
    return (
      <Box
        className={`
          group
          hover:bg-dark-50 hover:dark:bg-light-800
        `}
      >
        {content}
      </Box>
    );
  }

  return (
    <Link
      className={`
        group
        hover:bg-dark-50 hover:dark:bg-light-800
        focus:bg-dark-50 focus:dark:bg-light-800
      `}
      href={targetUrl}
    >
      {content}
    </Link>
  );
};
