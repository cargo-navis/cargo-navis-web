import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Box, Heading } from '@/ui';

export const AssignTrucksPage = () => {
  return (
    <DashboardLayout>
      <Box>
        <Heading as="h1" variant="text-xl">
          Assign Trucks
        </Heading>
      </Box>
    </DashboardLayout>
  );
};
