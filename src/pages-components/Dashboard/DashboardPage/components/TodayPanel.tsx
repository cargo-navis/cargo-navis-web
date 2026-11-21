import Link from 'next/link';

import { CountryFlag } from '@/components/shared/country-flag';
import { Panel } from '@/components/shared/panel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/utils/plural';
import { Icon } from '@/ui';

import { formatLongToday } from '../format';
import type { StopKind, TodayStop } from '../todayStops';
import type { Lookups } from '../useHomeData';
import { RetryLine } from './RetryLine';

const ROW_GRID = 'grid grid-cols-[1.25rem_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] items-center gap-3 px-4 py-3';

const KIND: Record<StopKind, { label: string; icon: 'IconPackageImport' | 'IconPackageExport'; tone: string }> = {
  utovar: { label: 'Utovar', icon: 'IconPackageImport', tone: 'text-utovar' },
  istovar: { label: 'Istovar', icon: 'IconPackageExport', tone: 'text-istovar' },
};

function StopRow({ stop, lookups }: { stop: TodayStop; lookups: Lookups }) {
  const client = stop.clientId ? lookups.clientsById.get(stop.clientId)?.name : undefined;
  const contractor = stop.contractorId ? lookups.contractorsById.get(stop.contractorId)?.name : undefined;
  const vehicle = stop.vehicleId ? lookups.vehiclesById.get(stop.vehicleId) : undefined;
  const driver = stop.driverId ? lookups.employeesById.get(stop.driverId)?.fullName : undefined;

  return (
    <Link
      className={cn(
        ROW_GRID,
        'w-full text-left text-sm outline-none hover:bg-muted/50 focus-visible:bg-muted/50',
        stop.done && 'text-muted-foreground'
      )}
      href={`/dashboard/shipments/${stop.shipmentId}`}
    >
      {stop.done ? (
        <Icon aria-label="Gotovo" className="text-success" icon="IconCheck" size="s" />
      ) : (
        <span className="size-2.5 justify-self-center rounded-full border-2 border-muted-foreground/40" />
      )}
      <span className="flex min-w-0 flex-col">
        <span className={cn('truncate font-medium', !stop.done && 'text-foreground')}>{client ?? '—'}</span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          #{stop.orderNumber}
          {stop.isAgency && (
            <Badge size="sm" tone="category">
              <Icon icon="IconBriefcase" size="xs" /> Agencijski
            </Badge>
          )}
        </span>
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="flex min-w-0 items-center gap-1.5">
          {stop.countryCode && <CountryFlag code={stop.countryCode} size="xxs" />}
          <span className="truncate">{stop.place}</span>
        </span>
        <span className="text-xs text-muted-foreground">{stop.cargo}</span>
      </span>
      <span className="flex min-w-0 flex-col">
        {stop.isAgency ? (
          <span className="truncate">{contractor ?? '—'}</span>
        ) : vehicle ? (
          <>
            <span className="font-mono text-xs">{vehicle.registration}</span>
            {driver && <span className="truncate text-xs text-muted-foreground">{driver}</span>}
          </>
        ) : (
          <span className="w-fit rounded-md border border-dashed border-destructive/60 px-2 py-0.5 text-xs text-destructive">
            + Dodijeli vozilo
          </span>
        )}
      </span>
    </Link>
  );
}

function SkeletonRows() {
  return (
    <div className="divide-y">
      {Array.from({ length: 4 }, (_, index) => (
        <div className={ROW_GRID} key={index}>
          <Skeleton className="size-3 rounded-full" />
          <span className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </span>
          <span className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </span>
          <span className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </span>
        </div>
      ))}
    </div>
  );
}

/** „Danas”: today's utovari, then istovari; finished ones dimmed at the end of their group (lab /home). */
export function TodayPanel({
  stops,
  isError,
  onRetry,
  lookups,
  today,
}: {
  stops: TodayStop[] | undefined;
  isError: boolean;
  onRetry(): void;
  lookups: Lookups;
  today: Date;
}) {
  const groups = (['utovar', 'istovar'] as const)
    .map((kind) => ({ kind, stops: (stops ?? []).filter((stop) => stop.kind === kind) }))
    .filter((group) => group.stops.length > 0);

  return (
    <Panel
      action={
        <Button nativeButton={false} render={<Link href="/dashboard/vehicle-stops" />} size="sm" variant="ghost">
          Prijevozi <Icon data-icon="inline-end" icon="IconChevronRight" size="s" />
        </Button>
      }
      bodyClassName="p-0"
      className="min-w-0"
      title={`Danas · ${formatLongToday(today)}`}
    >
      {isError ? (
        <RetryLine text="Današnji nalozi se nisu učitali." onRetry={onRetry} />
      ) : !stops ? (
        <SkeletonRows />
      ) : groups.length === 0 ? (
        <Empty className="min-h-60">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon icon="IconCalendarCheck" size="m" />
            </EmptyMedia>
            <EmptyTitle>Danas nema utovara ni istovara</EmptyTitle>
            <EmptyDescription>Nalozi s utovarom ili istovarom danas pojavit će se ovdje.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        groups.map((group) => {
          const done = group.stops.filter((stop) => stop.done).length;
          return (
            <div className="border-b last:border-0" key={group.kind}>
              <div className="flex items-center gap-2 bg-muted/40 px-4 py-1.5 text-xs font-medium text-muted-foreground">
                <Icon className={KIND[group.kind].tone} icon={KIND[group.kind].icon} size="s" />
                {KIND[group.kind].label} · {group.stops.length}
                {done > 0 && (
                  <span className="font-normal">
                    ({done} {plural(done, ['gotov', 'gotova', 'gotovih'])})
                  </span>
                )}
              </div>
              <div className="divide-y">
                {group.stops.map((stop) => (
                  <StopRow key={stop.id} lookups={lookups} stop={stop} />
                ))}
              </div>
            </div>
          );
        })
      )}
    </Panel>
  );
}
