/**
 * Tereti (lab /order parts.tsx CargoCards): one card per cargo — „Teret 1”, what and how much, LDM · kg, status; utovar
 * → istovar side by side (date, place, company, street, reference, note); the description below. Agency nalozi set the
 * cargo status by hand (a neutral badge with the „Status tereta (ručno)” menu, shared/cargoStatus); own nalozi get it
 * from the Ruta.
 */

import { CountryFlag } from '@/components/shared/country-flag';
import { STOP_KIND, type StopKind } from '@/components/shared/stop-kind';
import { Badge } from '@/components/ui/badge';
import type { Cargo, LoadingAddress, Shipment } from '@/lib/api';
import { LoadStatus } from '@/lib/api/shipments';
import { cn } from '@/lib/utils';
import { formatDateShort } from '@/lib/utils/date';
import { Icon } from '@/ui';

import { CARGO_STATUS_LABEL, cargoQuantity, cargoState, isOversize } from '../shared/cargo';
import { AgencyStatusBadge, AgencyStatusMenu } from '../shared/cargoStatus';
import { formatKg, formatNumber } from '../shared/format';

const STATE_BADGE = {
  waiting: { tone: 'neutral', label: CARGO_STATUS_LABEL[LoadStatus.NotYetLoaded] },
  loaded: { tone: 'info', label: CARGO_STATUS_LABEL[LoadStatus.Loaded] },
  unloaded: { tone: 'success', label: CARGO_STATUS_LABEL[LoadStatus.Unloaded] },
  late: { tone: 'danger', label: 'Kasni' },
} as const;

export function CargoStatusBadge({ cargo }: { cargo: Cargo }) {
  const badge = STATE_BADGE[cargoState(cargo)];
  return <Badge tone={badge.tone}>{badge.label}</Badge>;
}

function AgencyStatusBadgeMenu({ cargo, shipment }: { cargo: Cargo; shipment: Shipment }) {
  return (
    <AgencyStatusMenu
      cargo={cargo}
      shipment={shipment}
      trigger={
        <button
          className="flex items-center gap-1 rounded-full outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
          type="button"
        />
      }
    >
      <AgencyStatusBadge cargo={cargo} />
      <Icon className="text-muted-foreground" icon="IconChevronDown" size="s" />
    </AgencyStatusMenu>
  );
}

function SideBlock({
  kind,
  address,
  date,
  company,
  reference,
  note,
}: {
  kind: StopKind;
  address?: LoadingAddress | null;
  date?: string;
  company?: string;
  reference?: string;
  note?: string;
}) {
  const style = STOP_KIND[kind];
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className={cn('flex items-center gap-1 text-xs font-semibold tracking-wide uppercase', style.text)}>
        <Icon icon={style.icon} size="s" />
        {style.label} ·{' '}
        <span className="normal-case tabular-nums">
          {date ? formatDateShort(date) : <span className="text-destructive">datum nedostaje</span>}
        </span>
      </span>
      <span className="flex min-w-0 items-baseline gap-2 text-base">
        {address?.countryCode && <CountryFlag className="self-center" code={address.countryCode} size="xs" />}
        {address?.postalCode && <span className="text-muted-foreground tabular-nums">{address.postalCode}</span>}
        <span className="min-w-0 font-medium break-words">{address?.placeName || '—'}</span>
      </span>
      {company && <span className="text-sm font-medium">{company}</span>}
      {address?.streetName && <span className="text-sm text-muted-foreground">{address.streetName}</span>}
      {reference && <span className="text-xs text-muted-foreground">Ref. {reference}</span>}
      {note && <p className="mt-1 rounded-lg bg-muted/60 px-3 py-2 text-sm whitespace-pre-wrap">{note}</p>}
    </div>
  );
}

export function CargoCards({ shipment }: { shipment: Shipment }) {
  if (!shipment.cargo.length) {
    return <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">Nalog nema tereta.</p>;
  }
  return (
    <div className="flex flex-col gap-4">
      {shipment.cargo.map((cargo, index) => (
        <section className="rounded-xl border bg-card" key={cargo.id}>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b px-4 py-3">
            <h3 className="font-heading text-base font-bold tracking-tight">Teret {index + 1}</h3>
            <span className="flex items-center gap-1.5 text-sm">
              {cargoQuantity(cargo)}
              {isOversize(cargo) && (
                <Badge size="sm" tone="warning">
                  <Icon icon="IconAlertTriangle" size="xs" /> Izvanredne dimenzije
                </Badge>
              )}
            </span>
            <span className="text-sm text-muted-foreground tabular-nums">
              {cargo.ldm ? `${formatNumber(cargo.ldm, 2)} LDM` : '— LDM'} ·{' '}
              {cargo.weight ? formatKg(cargo.weight) : '— kg'}
            </span>
            <div className="ml-auto">
              {shipment.isAgency ? (
                <AgencyStatusBadgeMenu cargo={cargo} shipment={shipment} />
              ) : (
                <CargoStatusBadge cargo={cargo} />
              )}
            </div>
          </div>
          <div className="grid gap-4 p-4 md:grid-cols-[1fr_auto_1fr]">
            <SideBlock
              address={cargo.loadingAddress}
              company={cargo.loadingCompanyName}
              date={cargo.loadingReadyDate}
              kind="loading"
              note={cargo.loadingDescription}
              reference={cargo.loadingReference}
            />
            <Icon className="hidden self-center text-muted-foreground md:block" icon="IconArrowRight" size="m" />
            <SideBlock
              address={cargo.unloadingAddress}
              company={cargo.unloadingCompanyName}
              date={cargo.unloadingDueDate}
              kind="unloading"
              note={cargo.unloadingDescription}
              reference={cargo.unloadingReference}
            />
          </div>
          {cargo.description && (
            <div className="border-t px-4 py-3 text-sm whitespace-pre-wrap text-muted-foreground">
              {cargo.description}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
