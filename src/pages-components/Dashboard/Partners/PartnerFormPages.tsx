import { useRouter } from 'next/router';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { Skeleton } from '@/components/ui/skeleton';

import { PartnerDetailProblem, PhoneBackLink } from './PartnerDetail';
import { PartnerForm } from './PartnerForm';
import { type Partner, PARTNER_WORDS, partnerHref, type PartnerKind } from './partners';

/** Novi klijent / Novi kontraktor (lab /partners „Novi”): VIES lookup above an always-visible form. */
export function NewPartnerPage({ kind }: { kind: PartnerKind }) {
  const words = PARTNER_WORDS[kind];
  const router = useRouter();

  return (
    <DashboardLayout>
      <PageTitle title={words.newTitle} />
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-3">
          <PhoneBackLink href={words.basePath} label={words.many} />
          <h1 className="font-heading text-3xl font-bold tracking-tight">{words.newTitle}</h1>
        </header>
        <PartnerForm
          kind={kind}
          onCancel={() => void router.push(words.basePath)}
          onSaved={(saved) => void router.replace(saved.id ? partnerHref(kind, saved.id) : words.basePath)}
        />
      </div>
    </DashboardLayout>
  );
}

/** Uredi klijenta / kontraktora (lab /partners „Uredi”). */
export function EditPartnerPage({
  kind,
  partner,
  isLoading,
  isError,
  onRetry,
}: {
  kind: PartnerKind;
  partner: Partner | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry(): void;
}) {
  const words = PARTNER_WORDS[kind];
  const router = useRouter();

  return (
    <DashboardLayout
      breadcrumbs={
        partner
          ? [words.crumb, { label: partner.name, href: partnerHref(kind, partner.id) }, { label: 'Uredi' }]
          : undefined
      }
    >
      <PageTitle title={partner?.name} type={words.editTitle} />
      {partner ? (
        <div className="flex flex-col gap-6">
          <header className="flex flex-col gap-3">
            <PhoneBackLink href={partnerHref(kind, partner.id)} label={partner.name} />
            <h1 className="font-heading text-3xl font-bold tracking-tight">{words.editTitle}</h1>
          </header>
          <PartnerForm
            key={partner.id}
            kind={kind}
            partner={partner}
            onCancel={() => void router.push(partnerHref(kind, partner.id))}
            onSaved={(saved) => void router.replace(saved.id ? partnerHref(kind, saved.id) : words.basePath)}
          />
        </div>
      ) : isLoading ? (
        <div aria-busy className="flex max-w-2xl flex-col gap-6">
          <Skeleton className="h-8 w-56" />
          {Array.from({ length: 5 }, (_, index) => (
            <div className="flex flex-col gap-2" key={index}>
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : (
        <PartnerDetailProblem isError={isError} kind={kind} onRetry={onRetry} />
      )}
    </DashboardLayout>
  );
}
