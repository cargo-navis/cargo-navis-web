import { BackButton } from '@/components/BackButton';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import type { Tenant } from '@/lib/api/tenant.d';
import { ClientSideOnly } from '@/lib/components/ClientSideOnly';
import { useCurrentTenant } from '@/lib/hooks';
import { Box, FlexLayout, Heading } from '@/ui';

import { ContentLoader } from './ContentLoader';
import { TenantForm } from './TenantForm';

export const EditTenantPage = () => {
  const { data: tenant, isLoading } = useCurrentTenant();

  if (isLoading || !tenant) {
    return (
      <DashboardLayout>
        <ClientSideOnly>
          <ContentLoader />
        </ClientSideOnly>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageTitle title="Uredi tvrtku" />
      <MainContent tenant={tenant} />
    </DashboardLayout>
  );
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
