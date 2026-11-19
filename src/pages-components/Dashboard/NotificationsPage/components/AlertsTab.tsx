import Link from 'next/link';
import * as React from 'react';

import { getAlertItemData } from '@/components/AppMenu/utils/alerts';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import type { Alert } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Icon } from '@/ui';

import { type Warning, WARNING_ICON, type WarningKind } from '../../DashboardPage/warnings';
import { groupWarnings, WARNING_GROUPS } from '../notifications';
import { ListEmpty, ListError, ListSection, ListSkeleton, ROW, ROW_INTERACTIVE } from './parts';

type AlertWarning = Warning & { alert: Alert };
type KindFilter = WarningKind | 'all';

/** Rows per group before „Prikaži još N”. */
const LIMIT = 5;

function AlertRow({ warning }: { warning: AlertWarning }) {
  // Employee / vehicle / Postavke › Tvrtka; an overdue invoice opens its nalog.
  const { targetUrl } = getAlertItemData(warning.alert);
  const expired = warning.severity === 'expired';
  const content = (
    <>
      <Icon
        className={cn('mt-0.5', expired ? 'text-destructive' : 'text-warning')}
        icon={WARNING_ICON[warning.kind]}
        size="s"
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
        <span className="truncate text-sm font-medium">{warning.name}</span>
        {warning.subject && <span className="truncate text-sm text-muted-foreground">{warning.subject}</span>}
      </span>
      <span className={cn('shrink-0 text-xs tabular-nums', expired ? 'text-destructive' : 'text-warning')}>
        {warning.detail}
      </span>
    </>
  );
  return targetUrl ? (
    <Link className={cn(ROW, ROW_INTERACTIVE)} href={targetUrl}>
      {content}
    </Link>
  ) : (
    <div className={ROW}>{content}</div>
  );
}

/** „Treba pažnju”: kind filter + one card per kind, most urgent first, each with a link to the list that owns it. */
export function AlertsTab({
  warnings,
  isError,
  onRetry,
}: {
  warnings: AlertWarning[] | undefined;
  isError: boolean;
  onRetry(): void;
}) {
  const [filter, setFilter] = React.useState<KindFilter>('all');
  const [expanded, setExpanded] = React.useState<ReadonlySet<WarningKind>>(new Set());
  const byKind = React.useMemo(() => groupWarnings(warnings ?? []), [warnings]);

  if (isError) return <ListError title="Upozorenja se nisu učitala" onRetry={onRetry} />;
  if (!warnings) return <ListSkeleton />;
  if (warnings.length === 0) {
    return <ListEmpty icon="IconChecks" title="Ništa ne treba pažnju" variant="success" />;
  }

  const present = WARNING_GROUPS.filter((group) => byKind[group.kind].length > 0);
  // A kind that has just emptied (the last item fixed) falls back to „Sve”.
  const kind: KindFilter = filter !== 'all' && byKind[filter].length === 0 ? 'all' : filter;
  const shown = present.filter((group) => kind === 'all' || group.kind === kind);

  return (
    <>
      <div className="overflow-x-auto">
        <ButtonGroup>
          <Button
            aria-pressed={kind === 'all'}
            variant={kind === 'all' ? 'secondary' : 'outline'}
            onClick={() => setFilter('all')}
          >
            Sve <span className="text-muted-foreground tabular-nums">{warnings.length}</span>
          </Button>
          {present.map((group) => (
            <Button
              aria-pressed={kind === group.kind}
              key={group.kind}
              variant={kind === group.kind ? 'secondary' : 'outline'}
              onClick={() => setFilter(group.kind)}
            >
              {group.label} <span className="text-muted-foreground tabular-nums">{byKind[group.kind].length}</span>
            </Button>
          ))}
        </ButtonGroup>
      </div>
      <div className="flex flex-col gap-4">
        {shown.map((group) => {
          const rows = byKind[group.kind];
          const open = expanded.has(group.kind);
          const more = rows.length - LIMIT;
          return (
            <ListSection
              action={
                <Button nativeButton={false} render={<Link href={group.list.href} />} size="sm" variant="ghost">
                  {group.list.label}
                  <Icon data-icon="inline-end" icon="IconArrowRight" size="s" />
                </Button>
              }
              key={group.kind}
              title={`${group.label} · ${rows.length}`}
            >
              {(open ? rows : rows.slice(0, LIMIT)).map((warning) => (
                <AlertRow key={warning.id} warning={warning} />
              ))}
              {!open && more > 0 && (
                <button
                  className={cn('w-full px-4 py-2.5 text-left text-sm text-muted-foreground', ROW_INTERACTIVE)}
                  type="button"
                  onClick={() => setExpanded((current) => new Set(current).add(group.kind))}
                >
                  Prikaži još {more}
                </button>
              )}
            </ListSection>
          );
        })}
      </div>
    </>
  );
}
