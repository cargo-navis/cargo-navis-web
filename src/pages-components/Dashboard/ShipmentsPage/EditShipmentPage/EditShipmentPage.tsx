import { useRouter } from 'next/router';

import { BackButton } from '@/components/BackButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Shipment } from '@/lib/api';
import type { Tenant } from '@/lib/api/tenant.d';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useCurrentTenant, useShipment } from '@/lib/hooks';
import { NewShipmentForm } from '@/pages-components/Dashboard/ShipmentsPage/NewShipmentPage/NewShipmentForm';
import { Box, FlexLayout, Heading } from '@/ui';

export const EditShipmentPage = () => {
  const { query } = useRouter();
  const id = query.id;
  const parentShipmentId = query.parentShipmentId as string | undefined;

  const { data: tenant, isLoading: isTenantLoading } = useCurrentTenant();
  const { data: shipment, isLoading: isShipmentLoading } = useShipment(id as string);
  const { data: parentShipment, isLoading: isParentShipmentLoading } = useShipment(parentShipmentId || '');

  const isLoading = isTenantLoading || isShipmentLoading || (parentShipmentId && isParentShipmentLoading);

  return (
    <DashboardLayout>
      {isLoading || !shipment || !id || !tenant ? (
        <LoadingPage />
      ) : (
        <MainContent
          parentShipment={parentShipment}
          parentShipmentId={parentShipmentId}
          shipment={shipment}
          shipmentId={id as string}
          tenant={tenant}
        />
      )}
    </DashboardLayout>
  );
};

const MainContent = ({
  shipment,
  shipmentId,
  tenant,
  parentShipmentId,
  parentShipment,
}: {
  tenant: Tenant;
  shipment: Shipment;
  shipmentId: string;
  parentShipmentId?: string;
  parentShipment?: Shipment;
}) => {
  return (
    <Box>
      <Box className="py-5 flex flex-col gap-[40px]">
        <Heading as="h1" variant="text-xl">
          {parentShipment ? `Ažuriraj podnalog za ${parentShipment.orderNumber}` : 'Ažuriraj Nalog'}
        </Heading>
      </Box>
      <FlexLayout className="flex-col gap-[40px]">
        <BackButton targetLocation={`/dashboard/shipments/${shipmentId}`} />
        <NewShipmentForm parentShipmentId={parentShipmentId} shipment={shipment} tenant={tenant} />
      </FlexLayout>
    </Box>
  );
};
