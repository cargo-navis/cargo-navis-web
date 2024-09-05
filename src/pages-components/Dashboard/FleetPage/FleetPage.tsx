import { Box, Heading } from '@/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export const FleetPage = () => {
  return (
    <DashboardLayout>
      <Box>
        <Heading as="h1" variant="text-xl">Fleet</Heading>
      </Box>
    </DashboardLayout>
  );
}