import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAlerts } from '@/lib/hooks';
import { Box, DisplayIf, FlexLayout, Heading, LoadingSpinner, Text } from '@/ui';
import { AlertItem } from './components/AlertItem';

export const DashboardPage = () => {
  const { data: alerts, isLoading } = useAlerts();

  return (
    <DashboardLayout>
      <Box>
        <Heading as="h1" variant="text-xl">
          Dashboard
        </Heading>
      </Box>
      <Box className="py-5">
        <Text variant="text-l-medium">Alerts</Text>
        <FlexLayout className="flex-col max-w-[40%]">
          <DisplayIf condition={isLoading}>
            <Text color="text-color-3" variant="text-m">Loading alerts...</Text>
          </DisplayIf>
          <DisplayIf condition={!!alerts && !!alerts.length}>
            {alerts?.map((a) => <AlertItem key={a.alertable.uuid} alert={a}/>)}
          </DisplayIf>
          <DisplayIf condition={!isLoading && (!alerts || !alerts.length)}>
            <Text color="text-color-3" variant="text-m">No new alerts</Text>
          </DisplayIf>
        </FlexLayout>
      </Box>
    </DashboardLayout>
  );
};
