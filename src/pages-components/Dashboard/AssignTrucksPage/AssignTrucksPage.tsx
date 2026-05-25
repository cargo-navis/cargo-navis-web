import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { Box, Heading } from '@/ui';

export const AssignTrucksPage = () => {
  return (
    <DashboardLayout>
      <PageTitle title="Dodjela kamiona" />
      <Box>
        <Heading as="h1" variant="text-xl">
          Assign Trucks
        </Heading>
      </Box>
    </DashboardLayout>
  );
};
