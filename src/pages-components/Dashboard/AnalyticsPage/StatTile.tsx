import * as React from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Icon } from '@/ui';

import { percent } from './format';

/** Change vs the previous period. Under half a percent reads as no change (grey). */
export function Delta({
  now,
  before,
  upIsGood = true,
  range,
}: {
  now: number;
  before: number | undefined;
  upIsGood?: boolean;
  range: string;
}) {
  if (!before) return null;
  const change = ((now - before) / Math.abs(before)) * 100;
  const up = change >= 0;
  const good = up === upIsGood;
  return (
    <span className="flex items-center gap-1 text-xs">
      <span
        className={cn(
          'flex items-center gap-0.5 font-medium',
          Math.abs(change) < 0.5 ? 'text-muted-foreground' : good ? 'text-success' : 'text-destructive'
        )}
      >
        <Icon className="size-3.5! [&_svg]:size-full!" icon={up ? 'IconArrowUpRight' : 'IconArrowDownRight'} />
        {up ? '+' : '−'}
        {percent(Math.abs(change))}
      </span>
      <span className="text-muted-foreground">u odnosu na {range}</span>
    </span>
  );
}

export function StatTile({
  label,
  value,
  note,
  delta,
}: {
  label: string;
  value: string;
  note?: string;
  delta?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border bg-card p-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-heading text-2xl font-bold tracking-tight tabular-nums">{value}</span>
      {delta}
      {note && <span className="text-xs text-muted-foreground">{note}</span>}
    </div>
  );
}

export function StatTilesGrid({ dim, children }: { dim?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn('grid gap-3 transition-opacity sm:grid-cols-2 xl:grid-cols-4', dim && 'opacity-50')}>
      {children}
    </div>
  );
}

export function StatTileSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 rounded-xl border bg-card p-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}
