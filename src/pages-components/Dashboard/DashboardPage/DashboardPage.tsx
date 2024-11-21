import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAlerts } from '@/lib/hooks';
import { Box, DisplayIf, FlexLayout, Heading, Text } from '@/ui';
import { AlertItem } from './components/AlertItem';

export const DashboardPage = () => {
  const { data: alerts, isLoading } = useAlerts();

  return (
    <DashboardLayout>
      <Box>
        <Heading as="h1" variant="text-xl">
          Početna
        </Heading>
      </Box>
      <Box className="py-5">
        <Text variant="text-l-medium">Upozorenja</Text>
        <FlexLayout className="flex-col max-w-[40%]">
          <DisplayIf condition={isLoading}>
            <Text color="text-color-3" variant="text-m">
              Učitavam upozorenja...
            </Text>
          </DisplayIf>
          <DisplayIf condition={!!alerts && !!alerts.length}>
            {alerts?.map((a) => (
              <AlertItem key={a.alertable.uuid} alert={a} />
            ))}
          </DisplayIf>
          <DisplayIf condition={!isLoading && (!alerts || !alerts.length)}>
            <Text color="text-color-3" variant="text-m">
              Nema novih upozorenja
            </Text>
          </DisplayIf>
        </FlexLayout>
      </Box>
    </DashboardLayout>
  );
};
