import * as React from 'react';

import { CountryFlag } from '@/components/shared/country-flag';
import { cn } from '@/lib/utils';
import { getCountryName } from '@/lib/utils/countries';
import { plural } from '@/lib/utils/plural';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Icon } from '@/ui';

import type { Partner } from './partners';

/** „Porezni broj kopiran” + the value (lab /partners `copy`). */
export async function copyValue(value: string, what: string) {
  try {
    await navigator.clipboard.writeText(value);
    showSuccessToast({ title: `${what} kopiran`, description: value });
  } catch {
    showErrorToast({ title: 'Kopiranje nije uspjelo' });
  }
}

export const formatEuro = (value: number) =>
  `${value.toLocaleString('hr-HR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

/** „30 dana” / „1 dan”; short „30 d” for table cells. */
export function formatTerms(days: number | null, { short = false }: { short?: boolean } = {}) {
  if (days === null) return null;
  if (days === 0) return 'Odmah';
  return short ? `${days} d` : `${days} ${plural(days, ['dan', 'dana', 'dana'])}`;
}

export function Dash() {
  return <span className="text-muted-foreground">—</span>;
}

/** Flag + „Koprivnica, Hrvatska” under the name (list, detail header). */
export function PlaceLine({ partner, className }: { partner: Partner; className?: string }) {
  const place = partner.postalCode?.placeName;
  const country = partner.countryCode ? getCountryName(partner.countryCode) : '';
  if (!place && !country) return null;
  return (
    <span className={cn('flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground', className)}>
      {partner.countryCode && <CountryFlag code={partner.countryCode} size="xxs" />}
      <span className="truncate">{[place, country].filter(Boolean).join(', ')}</span>
    </span>
  );
}

/** Value that copies on click (copy icon on hover / focus). */
export function CopyValue({ value, what, suffix }: { value?: string; what: string; suffix?: React.ReactNode }) {
  if (!value) return <Dash />;
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <button
        className="group/copy flex max-w-full min-w-0 items-center gap-1.5 rounded-sm text-left text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        title={`Kopiraj: ${value}`}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          void copyValue(value, what);
        }}
      >
        <span className="truncate">{value}</span>
        <Icon
          className="size-3.5! shrink-0 opacity-0 transition-opacity [&_svg]:size-full! group-hover/copy:opacity-100 group-focus-visible/copy:opacity-100 pointer-coarse:opacity-60"
          icon="IconCopy"
          size="s"
        />
      </button>
      {suffix}
    </span>
  );
}

/** Label over value (detail „Podaci”). */
export function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="min-w-0 text-sm">{children}</div>
    </div>
  );
}
