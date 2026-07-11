import { useNotifications } from '@/lib/hooks';
import { FlexLayout, LoadingSpinner, Text } from '@/ui';

import { DashboardCard } from './DashboardCard';
import { NotificationItem } from './NotificationItem';

export const NotificationsCard = () => {
  const { data: notifications, isLoading } = useNotifications();

  return (
    <DashboardCard icon="IconBell" title="Obavijesti">
      {isLoading ? (
        <FlexLayout className="h-full items-center justify-center">
          <LoadingSpinner />
        </FlexLayout>
      ) : !notifications?.length ? (
        <FlexLayout className="h-full items-center justify-center">
          <Text color="text-color-3" variant="text-m">
            Nema novih obavijesti
          </Text>
        </FlexLayout>
      ) : (
        <FlexLayout className="h-full flex-col overflow-y-auto pr-1">
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </FlexLayout>
      )}
    </DashboardCard>
  );
};
