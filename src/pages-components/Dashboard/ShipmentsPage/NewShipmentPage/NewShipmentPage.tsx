import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useCurrentTenant } from '@/lib/hooks';
import { BackButton } from '@/pages-components/Dashboard/NewEmployeePage/BackButton';
import { Box, FlexLayout, Heading } from '@/ui';

import { NewShipmentForm } from './NewShipmentForm';

export const NewShipmentPage = () => {
  const { data: tenant, isLoading } = useCurrentTenant();

  if (isLoading || !tenant) return <LoadingPage />;

  return (
    <DashboardLayout>
      <Box>
        <FlexLayout className="flex-col gap-[40px]">
          <Heading as="h1" variant="text-xl">
            Novi Nalog
          </Heading>
        </FlexLayout>
        <FlexLayout className="py-5 flex-col gap-[40px]">
          <BackButton targetLocation="/dashboard/shipments" />
          <NewShipmentForm tenant={tenant} />
        </FlexLayout>
      </Box>
    </DashboardLayout>
  );
};
