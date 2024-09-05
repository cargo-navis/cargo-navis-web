import { Box, Heading } from '@/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export const DashboardPage = () => {
  return (
    <DashboardLayout>
      <Box>
        <Heading as="h1" variant="text-xl">Dashboard</Heading>
      </Box>
    </DashboardLayout>
  );
}