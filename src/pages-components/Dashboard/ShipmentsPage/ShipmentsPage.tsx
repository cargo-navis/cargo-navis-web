import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Shipment } from '@/lib/api';
import { useShipments } from '@/lib/hooks';
import { Box, Button, FlexLayout, Heading } from '@/ui';

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
      <Box className="py-5">{isLoading ? <ShipmentsTableLoader /> : <ShipmentsTable shipments={shipments} />}</Box>
    </DashboardLayout>
  );
};
