import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useShipments } from '@/lib/hooks';
import { Box, Button, FlexLayout, Heading, Text } from '@/ui';

import { ShipmentsTable } from './ShipmentsTable';

export const ShipmentsPage = () => {
  const { data: shipments, isLoading } = useShipments();

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
      <Box className="py-5">{isLoading ? <Text>Loading...</Text> : <ShipmentsTable shipments={shipments} />}</Box>
    </DashboardLayout>
  );
};
