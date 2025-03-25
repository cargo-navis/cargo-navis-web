import { useRouter } from 'next/router';

import { BackButton } from '@/components/BackButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useCurrentTenant, useShipment } from '@/lib/hooks';
import { Box, FlexLayout, Heading } from '@/ui';

import { NewShipmentForm } from './NewShipmentForm';

export const NewShipmentPage = () => {
  const { query } = useRouter();
  const { data: tenant, isLoading: isTenantLoading } = useCurrentTenant();
  const parentShipmentId = query.parentShipmentId as string | undefined;
  const { data: parentShipment, isLoading: isParentShipmentLoading } = useShipment(parentShipmentId || '');

  const isLoading = isTenantLoading || (parentShipmentId && isParentShipmentLoading);

  if (isLoading || !tenant) return <LoadingPage />;

  return (
    <DashboardLayout>
      <Box>
        <FlexLayout className="flex-col gap-[40px]">
          <Heading as="h1" variant="text-xl">
            {parentShipment ? `Novi podnalog za ${parentShipment.orderNumber}` : 'Novi Nalog'}
          </Heading>
        </FlexLayout>
        <FlexLayout className="py-5 flex-col gap-[40px]">
          <BackButton targetLocation="/dashboard/shipments" />
          <NewShipmentForm parentShipmentId={parentShipmentId} tenant={tenant} />
        </FlexLayout>
      </Box>
    </DashboardLayout>
  );
};
