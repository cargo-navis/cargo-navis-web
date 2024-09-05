import { Box, Heading } from '@/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export const AnalyticsPage = () => {
  return (
    <DashboardLayout>
      <Box>
        <Heading as="h1" variant="text-xl">Analytics</Heading>
      </Box>
    </DashboardLayout>
  );
}