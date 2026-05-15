import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { Box, Heading } from '@/ui';

export const CapacityPage = () => {
  return (
    <DashboardLayout>
      <PageTitle title="Kapacitet" />
      <Box>
        <Heading as="h1" variant="text-xl">
          Trucks Capacity
        </Heading>
      </Box>
    </DashboardLayout>
  );
};
