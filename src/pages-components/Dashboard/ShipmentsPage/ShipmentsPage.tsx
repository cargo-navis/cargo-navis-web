import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Shipment } from '@/lib/api';
import { EmptyTableState } from '@/lib/components/EmptyTableState';
import { useShipments } from '@/lib/hooks';
import { Box, Button, DisplayIf, FlexLayout, Heading } from '@/ui';

import { ShipmentsTable } from './ShipmentsTable';
import { ShipmentsTableLoader } from './ShipmentsTableLoader';
import { organizeSubshipments } from './utils';

export const ShipmentsPage = () => {
  const { data: shipments, isLoading } = useShipments<Shipment[]>({
    select: organizeSubshipments,
  });

  const isEmpty = shipments?.length === 0;

  return (
    <DashboardLayout>
      <Box>
        <FlexLayout className="items-center justify-between">
          <Heading as="h1" variant="text-xl">
            Nalozi
          </Heading>
          <DisplayIf condition={!isEmpty}>
            <Button as="a" href="/dashboard/shipments/new" iconLeft="PlusIcon" text="Dodaj Nalog" />
          </DisplayIf>
        </FlexLayout>
      </Box>
      <Box className="py-5">
        {isLoading ? (
          <ShipmentsTableLoader />
        ) : isEmpty ? (
          <EmptyTableState
            buttonHref="/dashboard/shipments/new"
            buttonText="Dodaj Nalog"
            description="Kada dodate naloge, oni će se prikazati ovdje."
            title="📄 Još nema zapisa o nalozima."
          />
        ) : (
          <ShipmentsTable shipments={shipments} />
        )}
      </Box>
    </DashboardLayout>
  );
};
