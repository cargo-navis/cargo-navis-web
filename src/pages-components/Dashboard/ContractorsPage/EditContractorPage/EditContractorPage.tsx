import { useRouter } from 'next/router';

import { useContractors } from '@/lib/hooks';
import { EditPartnerPage } from '@/pages-components/Dashboard/Partners/PartnerFormPages';
import { fromContractor } from '@/pages-components/Dashboard/Partners/partners';

export const EditContractorPage = () => {
  const { query } = useRouter();
  const id = query.id as string | undefined;
  const { data: contractors, isLoading, isError, refetch } = useContractors({ enabled: !!id });
  const contractor = contractors?.find((item) => String(item.id) === id);

  return (
    <EditPartnerPage
      isError={isError}
      isLoading={isLoading || !id}
      kind="contractor"
      partner={contractor ? fromContractor(contractor) : undefined}
      onRetry={() => void refetch()}
    />
  );
};
