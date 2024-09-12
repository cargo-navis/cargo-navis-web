import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Box, Heading } from '@/ui';

export const AnalyticsPage = () => {
  return (
    <DashboardLayout>
      <Box>
        <Heading as="h1" variant="text-xl">
          Analytics
        </Heading>
      </Box>
    </DashboardLayout>
  );
};
