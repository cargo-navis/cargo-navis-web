import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { Box, Heading } from '@/ui';

export const WarehousePage = () => {
  return (
    <DashboardLayout>
      <PageTitle title="Skladišta" />
      <Box>
        <Heading as="h1" variant="text-xl">
          Warehouses
        </Heading>
      </Box>
    </DashboardLayout>
  );
};
