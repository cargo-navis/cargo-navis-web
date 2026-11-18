import dayjs from 'dayjs';
import { useRouter } from 'next/router';

import { CRUMBS, DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { useContractors, useTransportContractorsAnalytics } from '@/lib/hooks';
import { pluralCount } from '@/lib/utils/plural';
import {
  MoneyStrip,
  PartnerDetail,
  PartnerDetailProblem,
  PartnerDetailSkeleton,
} from '@/pages-components/Dashboard/Partners/PartnerDetail';
import { fromContractor } from '@/pages-components/Dashboard/Partners/partners';
import { formatEuro } from '@/pages-components/Dashboard/Partners/parts';

/**
 * Money strip of a contractor (lab /partners `MONEY.contractor`): this year's agency nalozi with them as the carrier,
 * from getTransportContractorsAnalytics (cost, revenue, margin).
 */
function ContractorMoney({ contractorId }: { contractorId: string }) {
  const year = dayjs().year();
  const { data, isLoading, isError, refetch } = useTransportContractorsAnalytics({
    from: `${year}-01-01`,
    to: dayjs().format('YYYY-MM-DD'),
  });
  const totals = data?.find((item) => String(item.contractorId) === contractorId);
  const cost = totals?.totalCost ?? 0;
  const revenue = totals?.totalRevenue ?? 0;
  const margin = totals?.margin ?? 0;
  const failed = isError && !data;
  const retry = () => void refetch();
  const marginShare = revenue ? Math.round((margin / revenue) * 100) : null;

  return (
    <MoneyStrip
      isLoading={isLoading}
      items={[
        {
          label: `Plaćeno kontraktoru ${year}.`,
          value: formatEuro(cost),
          error: failed,
          onRetry: retry,
          detail: pluralCount(totals?.shipmentCount ?? 0, [
            'agencijski nalog',
            'agencijska naloga',
            'agencijskih naloga',
          ]),
        },
        {
          label: 'Naplaćeno klijentima',
          value: formatEuro(revenue),
          detail: 'za iste naloge',
          error: failed,
          onRetry: retry,
        },
        {
          label: 'Zarada',
          value: `${margin > 0 ? '+' : ''}${formatEuro(margin)}`,
          detail: marginShare === null ? undefined : `${marginShare}% marže`,
          tone: margin > 0 ? 'text-success' : margin < 0 ? 'text-destructive' : undefined,
          error: failed,
          onRetry: retry,
        },
      ]}
    />
  );
}

/**
 * Kontraktor detail (lab /partners „Detalj”). Their agency nalozi are left out until the backend can filter nalozi
 * by contractor (transportContractorId).
 */
export const SingleContractorPage = () => {
  const { query } = useRouter();
  const id = query.id as string | undefined;
  const { data: contractors, isLoading, isError, refetch } = useContractors({ enabled: !!id });
  const contractor = contractors?.find((item) => String(item.id) === id);

  return (
    <DashboardLayout breadcrumbs={contractor ? [CRUMBS.contractors, { label: contractor.name }] : undefined}>
      <PageTitle title={contractor?.name} type="Kontraktor" />
      {contractor ? (
        <PartnerDetail
          kind="contractor"
          money={<ContractorMoney contractorId={String(contractor.id)} />}
          partner={fromContractor(contractor)}
        />
      ) : isLoading || !id ? (
        <PartnerDetailSkeleton />
      ) : (
        <PartnerDetailProblem isError={isError} kind="contractor" onRetry={() => void refetch()} />
      )}
    </DashboardLayout>
  );
};
