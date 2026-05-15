import { useRouter } from 'next/router';

import { BackButton } from '@/components/BackButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useCurrentTenant, useShipment } from '@/lib/hooks';
import { Box, FlexLayout, Heading } from '@/ui';

import { ShipmentForm } from './ShipmentForm';

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
      <PageTitle title="Novi nalog" />
      <Box>
        <FlexLayout className="flex-col gap-[40px]">
          <Heading as="h1" variant="text-xl">
            {pageTitle}
          </Heading>
        </FlexLayout>
        <FlexLayout className="py-5 flex-col gap-[40px]">
          <BackButton targetLocation="/dashboard/shipments" />
          <ShipmentForm copyFromId={copyFromId} shipment={copyFromShipment} tenant={tenant} />
        </FlexLayout>
      </Box>
    </DashboardLayout>
  );
};
