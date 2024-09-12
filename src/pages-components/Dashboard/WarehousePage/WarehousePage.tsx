import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Box, Heading } from '@/ui';

export const WarehousePage = () => {
  return (
    <DashboardLayout>
      <Box>
        <Heading as="h1" variant="text-xl">
          Warehouses
        </Heading>
      </Box>
    </DashboardLayout>
  );
};
