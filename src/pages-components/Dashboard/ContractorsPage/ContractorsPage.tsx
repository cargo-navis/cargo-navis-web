import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { useContractors } from '@/lib/hooks';
import { PartnerList } from '@/pages-components/Dashboard/Partners/PartnerList';
import { toContractorPartners } from '@/pages-components/Dashboard/Partners/partners';

/** Podvozari (lab /partners „Popis”). */
export const ContractorsPage = () => {
  const { data, isLoading, isError, isFetching, refetch } = useContractors({ select: toContractorPartners });

  return (
    <DashboardLayout>
      <PageTitle title="Podvozari" />
      <PartnerList
        isError={isError}
        isFetching={isFetching}
        isLoading={isLoading}
        kind="contractor"
        partners={data}
        onRetry={() => void refetch()}
      />
    </DashboardLayout>
  );
};
