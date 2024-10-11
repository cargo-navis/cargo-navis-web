import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAlerts } from '@/lib/hooks';
import { Box, FlexLayout, Heading, Text } from '@/ui';
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
        <FlexLayout className="flex-col max-w-[50%]">
          {isLoading || !alerts ? 'Loading...' : alerts.map((a) => <AlertItem alert={a} />)}
        </FlexLayout>
      </Box>
    </DashboardLayout>
  );
};
