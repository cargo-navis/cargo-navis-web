import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAlerts, useNotifications } from '@/lib/hooks';
import { Box, DisplayIf, FlexLayout, Heading, Text } from '@/ui';

import { AlertItem } from './components/AlertItem';
import { NotificationItem } from './components/NotificationItem';

export const DashboardPage = () => {
  const { data: alerts, isLoading: isLoadingAlerts } = useAlerts();
  const { data: notifications, isLoading: isLoadingNotifications } = useNotifications();

  const isLoading = isLoadingAlerts || isLoadingNotifications;

  return (
    <DashboardLayout>
      <Box>
        <Heading as="h1" variant="text-xl">
          Početna
        </Heading>
      </Box>
      <Box className="py-5">
        <FlexLayout className="gap-7 max-w-[80%]">
          <FlexLayout className="flex-col flex-1">
            <Text color="text-color-3" variant="text-l-medium">
              {isLoading ? 'Učitavam obavijesti...' : 'Obavijesti'}
            </Text>
            <DisplayIf condition={!!notifications && !!notifications.length}>
              {notifications?.map((n) => (
                <NotificationItem key={n.id} notification={n} />
              ))}
            </DisplayIf>
            <DisplayIf condition={!isLoading && (!notifications || !notifications.length)}>
              <Text color="text-color-3" variant="text-m">
                Nema novih obavijesti
              </Text>
            </DisplayIf>
          </FlexLayout>
          <FlexLayout className="flex-col flex-1">
            <Text color="text-color-3" variant="text-l-medium">
              {isLoading ? 'Učitavam upozorenja...' : 'Upozorenja'}
            </Text>
            <DisplayIf condition={!!alerts && !!alerts.length}>
              {alerts?.map((a) => (
                <AlertItem alert={a} key={a.alertable.id + a.createdAt} />
              ))}
            </DisplayIf>
            <DisplayIf condition={!isLoading && (!alerts || !alerts.length)}>
              <Text color="text-color-3" variant="text-m">
                Nema novih upozorenja
              </Text>
            </DisplayIf>
          </FlexLayout>
        </FlexLayout>
      </Box>
    </DashboardLayout>
  );
};
