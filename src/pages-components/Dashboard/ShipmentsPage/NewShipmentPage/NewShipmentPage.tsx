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
  const copyFromId = query.copyFromId as string | undefined;

  const { data: copyFromShipment, isLoading: isCopyFromShipmentLoading } = useShipment(copyFromId || '');

  const isLoading = isTenantLoading || (copyFromId && isCopyFromShipmentLoading);

  if (isLoading || !tenant) return <LoadingPage />;

  let pageTitle = 'Novi Nalog';
  if (copyFromShipment) {
    pageTitle = `Kopija naloga ${copyFromShipment.orderNumber}`;
  }

  return (
    <DashboardLayout>
      <Box>
        <FlexLayout className="flex-col gap-[40px]">
          <Heading as="h1" variant="text-xl">
            {pageTitle}
          </Heading>
        </FlexLayout>
        <FlexLayout className="py-5 flex-col gap-[40px]">
          <BackButton targetLocation="/dashboard/shipments" />
          <NewShipmentForm copyFromId={copyFromId} shipment={copyFromShipment} tenant={tenant} />
        </FlexLayout>
      </Box>
    </DashboardLayout>
  );
};
