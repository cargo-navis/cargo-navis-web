import { keepPreviousData, useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SETTINGS_ACCOUNT_HREF, SETTINGS_COMPANY_HREF } from '@/components/layout/DashboardLayout/nav';
import { PageTitle } from '@/components/PageTitle';
import { Skeleton } from '@/components/ui/skeleton';
import { getPostalCode } from '@/lib/api';
import { useCurrentTenant, useCurrentUser } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { Icon, type IconType } from '@/ui';

import { AccountSection } from './AccountSection';
import { CompanySection } from './CompanySection';

export type SettingsSection = 'account' | 'company';

const SECTIONS: { key: SettingsSection; label: string; hint: string; icon: IconType; href: string }[] = [
  {
    key: 'account',
    label: 'Moj račun',
    hint: 'Profil, lozinka, ovaj uređaj',
    icon: 'IconUser',
    href: SETTINGS_ACCOUNT_HREF,
  },
  {
    key: 'company',
    label: 'Tvrtka',
    hint: 'Podaci, logo, podaci za naloge',
    icon: 'IconBuilding',
    href: SETTINGS_COMPANY_HREF,
  },
];

/**
 * Postavke (DECISIONS §5, lab /settings): one page with a side list Moj račun · Tvrtka (tabs above the content on
 * phones), at /dashboard/settings/account and /dashboard/settings/company. Old URLs redirect (next.config.mjs).
 */
export const SettingsPage = ({ section }: { section: SettingsSection }) => {
  const current = SECTIONS.find((item) => item.key === section)!;

  return (
    <DashboardLayout>
      <PageTitle title={current.label} type="Postavke" />
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Postavke</h1>
        <div className="grid items-start gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav className="flex gap-1 lg:sticky lg:top-[calc(var(--app-header-height,0px)+1rem)] lg:flex-col">
            {SECTIONS.map((item) => {
              const active = item.key === section;
              return (
                <Link
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-start gap-2.5 rounded-lg px-3 py-2 text-left text-sm',
                    active
                      ? 'bg-accent font-medium text-foreground'
                      : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                  )}
                  href={item.href}
                  key={item.key}
                >
                  <Icon className="mt-0.5 shrink-0" icon={item.icon} size="s" />
                  <span className="flex flex-col">
                    {item.label}
                    <span className="hidden text-xs font-normal text-muted-foreground lg:block">{item.hint}</span>
                  </span>
                </Link>
              );
            })}
          </nav>
          <div className="min-w-0">{section === 'account' ? <AccountContent /> : <CompanyContent />}</div>
        </div>
      </div>
    </DashboardLayout>
  );
};

function AccountContent() {
  const { data: user } = useCurrentUser();
  if (!user) return <SectionSkeleton panels={[180, 220, 150]} />;
  return <AccountSection user={user} />;
}

function CompanyContent() {
  const { data: tenant } = useCurrentTenant();
  // Today's edit form looks the postal code up by the address id; null when it can't be found (pick it again).
  const addressId = tenant?.address?.id;
  const postalCode = useQuery({
    queryKey: ['postal-code', addressId],
    queryFn: () => getPostalCode(addressId!),
    enabled: !!addressId,
    retry: false,
    staleTime: Infinity,
    // After a save that moves the address, keep the form mounted while the new code loads.
    placeholderData: keepPreviousData,
  });

  if (!tenant || (addressId && postalCode.isPending)) return <SectionSkeleton panels={[130, 330, 280]} />;
  // The form keeps its own state (saved / edited values) once mounted; refetches after a save don't reset it.
  return <CompanySection key={tenant.id} postalCode={postalCode.data ?? null} tenant={tenant} />;
}

/** First load: panel-shaped placeholders. */
function SectionSkeleton({ panels }: { panels: number[] }) {
  return (
    <div className="flex max-w-3xl flex-col gap-6">
      {panels.map((height, index) => (
        <div className="rounded-xl border bg-card" key={index}>
          <div className="flex min-h-12 items-center border-b px-4">
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="flex flex-col gap-3 p-4" style={{ height }}>
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
