import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { useClients } from '@/lib/hooks';
import { PartnerList } from '@/pages-components/Dashboard/Partners/PartnerList';
import { toClientPartners } from '@/pages-components/Dashboard/Partners/partners';

/** Klijenti (lab /partners „Popis”). */
export const ClientsPage = () => {
  const { data, isLoading, isError, isFetching, refetch } = useClients({ select: toClientPartners });

  return (
    <DashboardLayout>
      <PageTitle title="Klijenti" />
      <PartnerList
        isError={isError}
        isFetching={isFetching}
        isLoading={isLoading}
        kind="client"
        partners={data}
        onRetry={() => void refetch()}
      />
    </DashboardLayout>
  );
};
