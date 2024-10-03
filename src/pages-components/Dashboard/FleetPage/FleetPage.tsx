import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Box, Heading } from '@/ui';

export const FleetPage = () => {
  return (
    <DashboardLayout>
      <Box>
        <Heading as="h1" variant="text-xl">
          Fleet - Overview
        </Heading>
      </Box>
    </DashboardLayout>
  );
};
