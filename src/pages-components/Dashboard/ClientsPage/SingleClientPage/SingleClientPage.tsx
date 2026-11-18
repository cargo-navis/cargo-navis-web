import { useRouter } from 'next/router';

import { CRUMBS, DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { useClients } from '@/lib/hooks';
import {
  PartnerDetail,
  PartnerDetailProblem,
  PartnerDetailSkeleton,
} from '@/pages-components/Dashboard/Partners/PartnerDetail';
import { fromClient } from '@/pages-components/Dashboard/Partners/partners';

import { ClientNotificationEmails } from './ClientNotificationEmails';
import { ClientMoney, ClientOrders } from './ClientOrders';

/** Klijent detail (lab /partners „Detalj” + KAN-112 notification contacts). */
export const SingleClientPage = () => {
  const { query } = useRouter();
  const id = query.id as string | undefined;
  const { data: clients, isLoading, isError, refetch } = useClients({ enabled: !!id });
  const client = clients?.find((item) => String(item.id) === id);

  return (
    <DashboardLayout breadcrumbs={client ? [CRUMBS.clients, { label: client.name }] : undefined}>
      <PageTitle title={client?.name} type="Klijent" />
      {client ? (
        <PartnerDetail
          aside={<ClientNotificationEmails client={client} />}
          kind="client"
          main={<ClientOrders clientId={String(client.id)} />}
          money={<ClientMoney clientId={String(client.id)} />}
          partner={fromClient(client)}
        />
      ) : isLoading || !id ? (
        <PartnerDetailSkeleton />
      ) : (
        <PartnerDetailProblem isError={isError} kind="client" onRetry={() => void refetch()} />
      )}
    </DashboardLayout>
  );
};
