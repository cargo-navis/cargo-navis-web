import { useRouter } from 'next/router';
import type { ReactNode } from 'react';

import { CRUMBS, DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import type { Shipment, ShipmentDraft } from '@/lib/api';
import type { Tenant } from '@/lib/api/tenant.d';
import { useCurrentTenant, useShipment, useShipmentDraft } from '@/lib/hooks';

import { NalogForm, type NalogFormMode } from './NalogForm';
import { NalogFormHeader, NalogFormProblem, NalogFormSkeleton, useInitialValues } from './NalogFormLayout';
import { fetchPostalCodeData } from './utils';
import { emptyNalog, fromCopy, fromDraft, type NalogValues, withAgency } from './values';

const DRAFTS_HREF = '/dashboard/shipments?tab=drafts';
const LIST_HREF = '/dashboard/shipments';

const draftNotReadyMessages: Record<string, string> = {
  PENDING_EXTRACTION: 'Nalog još čeka obradu. Pokušajte ponovno za nekoliko trenutaka.',
  PROCESSING: 'AI obrada naloga je u tijeku. Pokušajte ponovno za nekoliko trenutaka.',
  CONFIRMED: 'Ovaj nalog je već potvrđen.',
  FAILED: 'Obrada naloga nije uspjela.',
};

const queryString = (value: string | string[] | undefined) => (typeof value === 'string' && value ? value : undefined);

/**
 * Novi nalog: /dashboard/shipments/new, `?copyFromId=` (Kopiraj nalog), `?draftId=` (Nalozi u pripremi), `?clientId=` /
 * `?contractorId=` (Novi nalog / Novi agencijski nalog from Klijenti / Podvozari: preselected).
 */
export const NewShipmentPage = () => {
  const router = useRouter();
  const copyFromId = queryString(router.query.copyFromId);
  const draftId = queryString(router.query.draftId);
  const clientId = queryString(router.query.clientId);
  const contractorId = queryString(router.query.contractorId);

  const tenantQuery = useCurrentTenant();
  const copyQuery = useShipment(copyFromId);
  const draftQuery = useShipmentDraft(draftId);
  const tenant = tenantQuery.data;
  const copyFrom = copyQuery.data;
  const draft = draftQuery.data;

  const mode: NalogFormMode = draftId ? 'draft' : copyFromId ? 'copy' : 'new';
  const draftReady = !!draft && draft.status === 'EXTRACTED';
  const dataReady = router.isReady && !!tenant && (mode !== 'copy' || !!copyFrom) && (mode !== 'draft' || draftReady);

  const { values, failed } = useInitialValues(
    dataReady ? () => initialValues(mode, tenant!, { copyFrom, draft, clientId, contractorId }) : null,
    router.asPath
  );

  const title =
    mode === 'copy'
      ? copyFrom
        ? `Kopija naloga #${copyFrom.orderNumber}`
        : 'Kopija naloga'
      : mode === 'draft'
        ? 'Novi nalog iz pripreme'
        : 'Novi nalog';
  const backHref = mode === 'draft' ? DRAFTS_HREF : LIST_HREF;
  const backLabel = mode === 'draft' ? 'Nalozi u pripremi' : 'Nalozi';

  const failedToLoad =
    failed || tenantQuery.isError || (mode === 'copy' && copyQuery.isError) || (mode === 'draft' && draftQuery.isError);

  let content: ReactNode;
  if (draft && !draftReady) {
    content = (
      <NalogFormProblem
        backHref={DRAFTS_HREF}
        backLabel="Nalozi u pripremi"
        danger={draft.status === 'FAILED'}
        description={
          <>
            {draftNotReadyMessages[draft.status] ?? 'Nalog još nije spreman.'}
            {draft.status === 'FAILED' && draft.errorMessage && (
              <span className="mt-1 block text-xs">{draft.errorMessage}</span>
            )}
          </>
        }
        icon={draft.status === 'FAILED' ? 'IconAlertOctagon' : 'IconHourglass'}
        title="Nalog nije spreman"
      />
    );
  } else if (failedToLoad) {
    content = (
      <NalogFormProblem
        backHref={backHref}
        backLabel={backLabel}
        danger
        description="Provjeri vezu i pokušaj ponovno."
        icon="IconAlertOctagon"
        title={mode === 'copy' ? 'Nalog za kopiranje se nije učitao' : 'Podaci se nisu učitali'}
        onRetry={() => router.reload()}
      />
    );
  } else if (!values || !tenant) {
    content = <NalogFormSkeleton />;
  } else {
    content = (
      <div className="flex flex-col gap-6">
        <NalogFormHeader backHref={backHref} backLabel={backLabel} title={title} />
        <NalogForm
          cancelHref={backHref}
          draft={mode === 'draft' ? draft : undefined}
          initial={values}
          key={router.asPath}
          mode={mode}
          tenant={tenant}
        />
      </div>
    );
  }

  return (
    <DashboardLayout breadcrumbs={[CRUMBS.shipments, { label: title }]}>
      <PageTitle title={title} />
      {content}
    </DashboardLayout>
  );
};

async function initialValues(
  mode: NalogFormMode,
  tenant: Tenant,
  {
    copyFrom,
    draft,
    clientId,
    contractorId,
  }: { copyFrom?: Shipment; draft?: ShipmentDraft; clientId?: string; contractorId?: string }
): Promise<NalogValues> {
  if (mode === 'draft' && draft) return fromDraft(draft, tenant, fetchPostalCodeData);
  if (mode === 'copy' && copyFrom) return fromCopy(copyFrom, tenant, fetchPostalCodeData);
  let values = emptyNalog(tenant);
  if (clientId) values = { ...values, clientId };
  // „Novi agencijski nalog” from a podvozar: Agencijski with that podvozar.
  if (contractorId) values = { ...withAgency(values, true, tenant.id), transportContractorId: contractorId };
  return values;
}
