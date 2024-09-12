import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Box, Heading } from '@/ui';

export const DashboardPage = () => {
  return (
    <DashboardLayout>
      <Box>
        <Heading as="h1" variant="text-xl">
          Dashboard
        </Heading>
      </Box>
    </DashboardLayout>
  );
};
