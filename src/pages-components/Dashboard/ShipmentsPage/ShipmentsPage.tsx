import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Box, Button, FlexLayout, Heading } from '@/ui';

export const ShipmentsPage = () => {
  return (
    <DashboardLayout>
      <Box>
        <FlexLayout className="items-center justify-between">
          <Heading as="h1" variant="text-xl">
            Nalozi
          </Heading>
          <Button as="a" href="/dashboard/shipments/new" iconLeft="PlusIcon" text="Dodaj Nalog" />
        </FlexLayout>
      </Box>
      <Box className="py-5">{/*  ShipmentsTable */}</Box>
    </DashboardLayout>
  );
};
