import { useRouter } from 'next/router';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Shipment } from '@/lib/api';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useShipment } from '@/lib/hooks';
import { BackButton } from '@/pages-components/Dashboard/NewEmployeePage/BackButton';
import { NewShipmentForm } from '@/pages-components/Dashboard/ShipmentsPage/NewShipmentPage/NewShipmentForm';
import { Box, FlexLayout, Heading } from '@/ui';

export const EditShipmentPage = () => {
  const { query } = useRouter();
  const id = query.id;

  const { data: shipment, isLoading } = useShipment(id as string);

  return (
    <DashboardLayout>
      {isLoading || !shipment || !id ? <LoadingPage /> : <MainContent shipment={shipment} shipmentId={id as string} />}
    </DashboardLayout>
  );
};

const MainContent = ({ shipment, shipmentId }: { shipment: Shipment; shipmentId: string }) => {
  return (
    <Box>
      <Box className="py-5 flex flex-col gap-[40px]">
        <Heading as="h1" variant="text-xl">
          Ažuriraj Nalog
        </Heading>
      </Box>
      <FlexLayout className="flex-col gap-[40px]">
        <BackButton targetLocation={`/dashboard/shipments/${shipmentId}`} />
        <NewShipmentForm shipment={shipment} />
      </FlexLayout>
    </Box>
  );
};
