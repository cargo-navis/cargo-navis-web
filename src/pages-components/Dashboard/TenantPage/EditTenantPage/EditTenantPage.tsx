import { BackButton } from '@/components/BackButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import type { Tenant } from '@/lib/api/tenant.d';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useCurrentTenant } from '@/lib/hooks';
import { Box, FlexLayout, Heading } from '@/ui';

import { TenantForm } from './TenantForm';

export const EditTenantPage = () => {
  const { data: tenant, isLoading } = useCurrentTenant();

  return <DashboardLayout>{isLoading || !tenant ? <LoadingPage /> : <MainContent tenant={tenant} />}</DashboardLayout>;
};

const MainContent = ({ tenant }: { tenant: Tenant }) => {
  return (
    <Box>
      <Box className="py-5 flex flex-col gap-[40px]">
        <Heading as="h1" variant="text-xl">
          Ažuriraj Podatke Tvrtke
        </Heading>
      </Box>
      <FlexLayout className="flex-col gap-[40px]">
        <BackButton targetLocation="/dashboard/tenant" />
        <TenantForm tenant={tenant} />
      </FlexLayout>
    </Box>
  );
};
