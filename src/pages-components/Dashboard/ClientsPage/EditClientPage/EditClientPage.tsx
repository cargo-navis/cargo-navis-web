import { useRouter } from 'next/router';

import { useClients } from '@/lib/hooks';
import { EditPartnerPage } from '@/pages-components/Dashboard/Partners/PartnerFormPages';
import { fromClient } from '@/pages-components/Dashboard/Partners/partners';

export const EditClientPage = () => {
  const { query } = useRouter();
  const id = query.id as string | undefined;
  const { data: clients, isLoading, isError, refetch } = useClients({ enabled: !!id });
  const client = clients?.find((item) => String(item.id) === id);

  return (
    <EditPartnerPage
      isError={isError}
      isLoading={isLoading || !id}
      kind="client"
      partner={client ? fromClient(client) : undefined}
      onRetry={() => void refetch()}
    />
  );
};
