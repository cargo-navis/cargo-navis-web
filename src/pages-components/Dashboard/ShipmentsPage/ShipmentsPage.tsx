import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Shipment } from '@/lib/api';
import { useShipments } from '@/lib/hooks';
import { Box, Button, FlexLayout, Heading, Text } from '@/ui';

import { ShipmentsTable } from './ShipmentsTable';
import { ShipmentsTableLoader } from './ShipmentsTableLoader';
import { organizeSubshipments } from './utils';

export const ShipmentsPage = () => {
  const { data: shipments, isLoading } = useShipments<Shipment[]>({
    select: organizeSubshipments,
  });

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
      <Box className="py-5">
        {isLoading ? (
          <ShipmentsTableLoader />
        ) : shipments?.length ? (
          <ShipmentsTable shipments={shipments} />
        ) : (
          <EmptyState />
        )}
      </Box>
    </DashboardLayout>
  );
};

const EmptyState = () => {
  return (
    <FlexLayout className="flex-col gap-4 items-center justify-center h-full my-10">
      <Text color="text-color-2" variant="text-l-medium">
        Nemate naloga u bazi
      </Text>
      <Text color="text-color-3" variant="text-s-medium">
        Dodajte novi nalog klikom na dugme ispod
      </Text>
      <Button as="a" href="/dashboard/shipments/new" iconLeft="PlusIcon" text="Dodaj Nalog" />
    </FlexLayout>
  );
};
