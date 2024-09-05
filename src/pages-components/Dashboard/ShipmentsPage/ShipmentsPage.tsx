import { Box, Heading } from '@/ui';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export const ShipmentsPage = () => {
  return (
    <DashboardLayout>
      <Box>
        <Heading as="h1" variant="text-xl">Shipments</Heading>
      </Box>
    </DashboardLayout>
  );
}