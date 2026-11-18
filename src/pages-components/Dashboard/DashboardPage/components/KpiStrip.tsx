import dayjs from 'dayjs';
import Link from 'next/link';
import * as React from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { InvoiceStatus } from '@/lib/api/shipments';
import { cn } from '@/lib/utils';
import { formatDateShort } from '@/lib/utils/date';
import { plural } from '@/lib/utils/plural';
import { Icon } from '@/ui';

import { weekdayShort } from '../format';
import type { TodayStop } from '../todayStops';
import { useCounts, useLastSevenDays } from '../useHomeData';
import { RetryLine } from './RetryLine';

const ISO = 'YYYY-MM-DD';

/**
 * Nalozi already filtered (the API's filter names; the Nalozi page reads them from the URL).
 */
const shipmentsHref = (params: Record<string, string>) => `/dashboard/shipments?${new URLSearchParams(params)}`;

function KpiTile({
  label,
  value,
  sub,
  tone,
  href,
  error,
  children,
}: {
  label: string;
  value: number | undefined;
  /** Load error: the tile shows a retry instead of its number (no button inside a link, so no link then). */
  error?: { onRetry(): void };
  sub?: React.ReactNode;
  tone?: 'danger';
  href: string;
  children?: React.ReactNode;
}) {
  if (error) {
    return (
      <div className="flex flex-col gap-1 rounded-xl border bg-card p-4">
        <span className="text-sm text-muted-foreground">{label}</span>
        <RetryLine className="p-0" text="Nije učitano." onRetry={error.onRetry} />
      </div>
    );
  }
  // A tile is a shortcut: it opens Nalozi already filtered (or Analitika).
  return (
    <Link
      className="group flex flex-col gap-1 rounded-xl border bg-card p-4 text-left transition-colors outline-none hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
      href={href}
    >
      <span className="flex items-center justify-between text-sm text-muted-foreground">
        {label}
        <Icon
          className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          icon="IconArrowRight"
          size="s"
        />
      </span>
      <span className="flex items-end justify-between gap-3">
        {value === undefined ? (
          <Skeleton className="h-8 w-12" />
        ) : (
          <span
            className={cn(
              'font-heading text-2xl font-bold tracking-tight tabular-nums',
              tone === 'danger' && 'text-destructive'
            )}
          >
            {value.toLocaleString('hr-HR')}
          </span>
        )}
        {children}
      </span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </Link>
  );
}

/** 7 bars, today lighter; hover names the day. Plain divs: no chart library for 7 marks. */
function Sparkline({ days }: { days: { date: Date; count: number; partial: boolean }[] }) {
  const max = Math.max(1, ...days.map((day) => day.count));
  return (
    <span aria-hidden className="flex h-8 items-end gap-1">
      {days.map((day) => (
        <Tooltip key={day.date.toISOString()}>
          <TooltipTrigger render={<span className="flex h-full w-2 items-end" />}>
            <span
              className={cn('w-full rounded-t-[2px] bg-series-regular', day.partial && 'opacity-40')}
              style={{ height: `${Math.max(8, (day.count / max) * 100)}%` }}
            />
          </TooltipTrigger>
          <TooltipContent>
            {weekdayShort(day.date)} {formatDateShort(day.date)}: {day.count}
            {day.partial ? ' (u tijeku)' : ''}
          </TooltipContent>
        </Tooltip>
      ))}
    </span>
  );
}

const doneSub = (stops: TodayStop[]) => {
  const done = stops.filter((stop) => stop.done).length;
  return `${done} ${plural(done, ['gotov', 'gotova', 'gotovih'])} · ${stops.length - done} ${plural(stops.length - done, ['preostao', 'preostala', 'preostalo'])}`;
};

export function KpiStrip({
  stops,
  stopsError,
  overdueOldestDays,
  today,
}: {
  stops: TodayStop[] | undefined;
  /** Today's nalozi failed to load: the two „Danas” tiles offer a retry. */
  stopsError?: { onRetry(): void };
  overdueOldestDays: number | undefined;
  today: Date;
}) {
  const counts = useCounts();
  const { days, previousTotal, error: daysError } = useLastSevenDays(today);
  const day = dayjs(today).format(ISO);

  const loads = stops?.filter((stop) => stop.kind === 'utovar');
  const unloads = stops?.filter((stop) => stop.kind === 'istovar');
  const week = days?.reduce((sum, item) => sum + item.count, 0);
  const change = week !== undefined && previousTotal ? ((week - previousTotal) / previousTotal) * 100 : undefined;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
      <KpiTile
        error={stopsError}
        href={shipmentsHref({ loadingReadyDateFrom: day, loadingReadyDateTo: day })}
        label="Danas utovara"
        sub={loads && doneSub(loads)}
        value={loads?.length}
      />
      <KpiTile
        error={stopsError}
        href={shipmentsHref({ unloadingDueDateFrom: day, unloadingDueDateTo: day })}
        label="Danas istovara"
        sub={unloads && doneSub(unloads)}
        value={unloads?.length}
      />
      <KpiTile
        error={counts.notInvoicedError}
        href={shipmentsHref({ invoiceStatus: InvoiceStatus.NotSent })}
        label="Nefakturirano"
        sub={
          counts.notInvoiced !== undefined &&
          `${plural(counts.notInvoiced, ['nalog čeka', 'naloga čekaju', 'naloga čeka'])} fakturu`
        }
        value={counts.notInvoiced}
      />
      <KpiTile
        error={counts.overdueError}
        href={shipmentsHref({ isInvoiceOverdue: 'true' })}
        label="Dospjelo, neplaćeno"
        sub={overdueOldestDays !== undefined && counts.overdue ? `najstarija ${overdueOldestDays} d` : undefined}
        tone={counts.overdue ? 'danger' : undefined}
        value={counts.overdue}
      />
      <KpiTile
        error={daysError}
        href={`/dashboard/analytics?po=dan&od=${dayjs(today).subtract(6, 'day').format(ISO)}&do=${day}`}
        label="Nalozi · zadnjih 7 dana"
        sub={
          change !== undefined && (
            <span className="flex items-center gap-1">
              <span
                className={cn(
                  'flex items-center gap-0.5 font-medium',
                  change >= 0 ? 'text-success' : 'text-destructive'
                )}
              >
                <Icon
                  className="size-3.5! [&_svg]:size-full!"
                  icon={change >= 0 ? 'IconArrowUpRight' : 'IconArrowDownRight'}
                />
                {change >= 0 ? '+' : '−'}
                {Math.abs(change).toLocaleString('hr-HR', { maximumFractionDigits: 0 })} %
              </span>
              vs prethodnih 7
            </span>
          )
        }
        value={week}
      >
        {days && <Sparkline days={days} />}
      </KpiTile>
    </div>
  );
}
