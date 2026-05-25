import { useRouter } from 'next/router';

import { BackButton } from '@/components/BackButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import type { Shipment } from '@/lib/api';
import type { Tenant } from '@/lib/api/tenant.d';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useCurrentTenant, useShipment } from '@/lib/hooks';
import { ShipmentForm } from '@/pages-components/Dashboard/ShipmentsPage/NewShipmentPage/ShipmentForm';
import { Box, FlexLayout, Heading } from '@/ui';

export const EditShipmentPage = () => {
  const { query } = useRouter();
  const id = query.id;

  const { data: tenant, isLoading: isTenantLoading } = useCurrentTenant();
  const { data: shipment, isLoading: isShipmentLoading } = useShipment(id as string);

  const isLoading = isTenantLoading || isShipmentLoading;

  return (
    <DashboardLayout>
      <PageTitle title={shipment?.orderNumber} type="Uredi nalog" />
      {isLoading || !shipment || !id || !tenant ? (
        <LoadingPage />
      ) : (
        <MainContent shipment={shipment} shipmentId={id as string} tenant={tenant} />
      )}
    </DashboardLayout>
  );
};

const MainContent = ({ shipment, shipmentId, tenant }: { tenant: Tenant; shipment: Shipment; shipmentId: string }) => {
  return (
    <Box>
      <Box className="py-5 flex flex-col gap-[40px]">
        <Heading as="h1" variant="text-xl">
          Ažuriraj Nalog
        </Heading>
      </Box>
      <FlexLayout className="flex-col gap-[40px]">
        <BackButton targetLocation={`/dashboard/shipments/${shipmentId}`} />
        <ShipmentForm shipment={shipment} tenant={tenant} />
      </FlexLayout>
    </Box>
  );
};
