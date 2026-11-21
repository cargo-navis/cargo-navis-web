import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

import { CountryFlag } from '@/components/shared/country-flag';
import { EntityNotFound } from '@/components/shared/not-found';
import { Panel } from '@/components/shared/panel';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { getCountryName } from '@/lib/utils/countries';
import { Icon } from '@/ui';

import { PartnerDeleteDialog } from './PartnerDeleteDialog';
import { type Partner, PARTNER_WORDS, partnerEditHref, type PartnerKind, partnerNewOrderHref } from './partners';
import { CopyValue, copyValue, Dash, Fact, formatTerms, PlaceLine } from './parts';

/** Back link for phones, where the shell hides the breadcrumb trail. */
export function PhoneBackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground md:hidden"
      href={href}
    >
      <Icon icon="IconArrowLeft" size="s" /> {label}
    </Link>
  );
}

export interface MoneyItem {
  label: string;
  value: React.ReactNode;
  detail?: React.ReactNode;
  /** Text colour of the value (e.g. `text-destructive`). */
  tone?: string;
  /** The number couldn't be loaded: „—” + „Pokušaj ponovno” instead of a misleading 0. */
  error?: boolean;
  onRetry?(): void;
}

/** Money strip under the header (lab /partners `MONEY`): three cells, values in Sora. */
export function MoneyStrip({ items, isLoading }: { items: MoneyItem[]; isLoading?: boolean }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-3">
      {items.map((item) => (
        <div className="flex flex-col gap-0.5 bg-card px-4 py-3" key={item.label}>
          <span className="text-xs text-muted-foreground">{item.label}</span>
          {isLoading ? (
            <Skeleton className="my-1 h-5 w-28" />
          ) : (
            <span
              className={cn(
                'font-heading text-lg font-bold tracking-tight tabular-nums',
                item.error ? 'text-muted-foreground' : item.tone
              )}
            >
              {item.error ? '—' : item.value}
            </span>
          )}
          {isLoading ? (
            <Skeleton className="h-3 w-20" />
          ) : item.error ? (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              Nije se učitalo.
              {item.onRetry && (
                <button className="font-medium text-foreground hover:underline" type="button" onClick={item.onRetry}>
                  Pokušaj ponovno
                </button>
              )}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">{item.detail ?? ' '}</span>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * Klijent / Podvozar detail (lab /partners „Detalj”, DECISIONS §5): header with Uredi / Novi nalog (contractor:
 * Novi agencijski nalog) / ⋯, money strip, left „Podaci” (+ `aside` panels), right `main` (their nalozi).
 */
export function PartnerDetail({
  kind,
  partner,
  money,
  aside,
  main,
}: {
  kind: PartnerKind;
  partner: Partner;
  money?: React.ReactNode;
  aside?: React.ReactNode;
  main?: React.ReactNode;
}) {
  const words = PARTNER_WORDS[kind];
  const router = useRouter();
  const [deleting, setDeleting] = React.useState<Partner | null>(null);
  const email = kind === 'contractor' ? partner.emails[0] : undefined;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <PhoneBackLink href={words.basePath} label={words.many} />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              <Icon icon={words.icon} size="s" /> {words.one}
            </span>
            <h1 className="font-heading text-3xl font-bold tracking-tight">{partner.name}</h1>
            <PlaceLine className="text-sm" partner={partner} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button nativeButton={false} render={<Link href={partnerEditHref(kind, partner.id)} />} variant="outline">
              <Icon data-icon="inline-start" icon="IconPencil" size="s" /> Uredi
            </Button>
            <Button nativeButton={false} render={<Link href={partnerNewOrderHref(kind, partner.id)} />}>
              <Icon data-icon="inline-start" icon="IconPlus" size="s" /> {words.newOrder}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button aria-label="Više akcija" size="icon" variant="outline" />}>
                <Icon icon="IconDots" size="s" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  disabled={!partner.taxId}
                  onClick={() => void copyValue(partner.taxId, 'Porezni broj')}
                >
                  <Icon icon="IconCopy" size="s" /> Kopiraj porezni broj
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => setDeleting(partner)}>
                  <Icon icon="IconTrash" size="s" /> Obriši
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {money}

      <div className="grid items-start gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-6">
          <Panel bodyClassName="py-1.5 divide-y" title="Podaci">
            <Fact label="Porezni broj">
              <CopyValue value={partner.taxId} what="Porezni broj" />
            </Fact>
            <Fact label="Valuta plaćanja">{formatTerms(partner.termsOfPayment) ?? <Dash />}</Fact>
            {kind === 'contractor' && (
              <Fact label="Email">
                {email ? (
                  <span className="flex items-center gap-2">
                    <a
                      className="flex min-w-0 items-center gap-1.5 text-brand hover:underline"
                      href={`mailto:${email}`}
                    >
                      <Icon className="shrink-0" icon="IconMail" size="s" /> <span className="truncate">{email}</span>
                    </a>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Button
                            aria-label="Kopiraj email"
                            size="icon-xs"
                            variant="ghost"
                            onClick={() => void copyValue(email, 'Email')}
                          />
                        }
                      >
                        <Icon icon="IconCopy" size="xs" />
                      </TooltipTrigger>
                      <TooltipContent>Kopiraj</TooltipContent>
                    </Tooltip>
                  </span>
                ) : (
                  <Dash />
                )}
              </Fact>
            )}
            <Fact label="Adresa sjedišta">
              <div className="flex flex-col">
                <span>{partner.street || <Dash />}</span>
                <span className="flex items-center gap-1.5">
                  {partner.countryCode && <CountryFlag code={partner.countryCode} size="xxs" />}
                  {[
                    [partner.postalCode?.postalCode, partner.postalCode?.placeName].filter(Boolean).join(' '),
                    partner.countryCode ? getCountryName(partner.countryCode) : '',
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </span>
              </div>
            </Fact>
          </Panel>
          {aside}
        </div>
        {main ?? <div className="hidden xl:block" />}
      </div>

      <PartnerDeleteDialog
        kind={kind}
        partner={deleting}
        onDeleted={() => void router.replace(words.basePath)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      />
    </div>
  );
}

/** First load of a detail page: page-shaped skeleton (DECISIONS §2 Loading). */
export function PartnerDetailSkeleton() {
  return (
    <div aria-busy className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-72" />
          <Skeleton className="h-4 w-40" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <Skeleton className="h-20 w-full rounded-xl" />
      <div className="grid items-start gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Skeleton className="h-72 rounded-xl" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}

/** Detail could not be shown: not found (deleted, wrong link: D „Kontekstualno”) or the load failed. */
export function PartnerDetailProblem({
  kind,
  isError,
  onRetry,
}: {
  kind: PartnerKind;
  isError: boolean;
  onRetry(): void;
}) {
  if (!isError) return <EntityNotFound kind={kind} />;
  return (
    <div className="rounded-xl border">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="danger">
            <Icon icon="IconAlertTriangle" size="m" />
          </EmptyMedia>
          <EmptyTitle>Podaci se nisu učitali</EmptyTitle>
          <EmptyDescription>Provjeri vezu i pokušaj ponovno.</EmptyDescription>
        </EmptyHeader>
        <Button variant="outline" onClick={onRetry}>
          <Icon data-icon="inline-start" icon="IconRefresh" size="s" /> Pokušaj ponovno
        </Button>
      </Empty>
    </div>
  );
}
