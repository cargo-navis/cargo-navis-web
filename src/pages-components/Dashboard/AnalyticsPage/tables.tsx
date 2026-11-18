import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

import { Panel } from '@/components/shared/panel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Icon } from '@/ui';

import { eur, int, percent } from './format';

function ShareBar({ share }: { share: number }) {
  return (
    <span className="flex items-center justify-end gap-2">
      <span className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
        <span className="block h-full rounded-full bg-foreground/50" style={{ width: `${share}%` }} />
      </span>
      <span className="w-12 text-right tabular-nums">{percent(share)}</span>
    </span>
  );
}

function EmptyRow({ colSpan }: { colSpan: number }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell className="py-6 text-center text-sm text-muted-foreground" colSpan={colSpan}>
        Nema podataka za odabrano razdoblje.
      </TableCell>
    </TableRow>
  );
}

function SkeletonRows({ colSpan }: { colSpan: number }) {
  return (
    <>
      {Array.from({ length: 5 }, (_, index) => (
        <TableRow className="hover:bg-transparent" key={index}>
          {Array.from({ length: colSpan }, (__, cell) => (
            <TableCell className={cn('py-3', cell === 0 && 'pl-4', cell === colSpan - 1 && 'pr-4')} key={cell}>
              <Skeleton className={cn('h-4', cell === 0 ? 'w-36' : 'ml-auto w-14')} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

/**
 * A row opens the entity: the name is a real link (keyboard, middle-click, „open in new tab”), and a click anywhere else
 * on the row follows it too.
 */
function useOpenRow() {
  const router = useRouter();
  return (href: string | undefined) =>
    href
      ? {
          className: 'cursor-pointer',
          onClick: (event: React.MouseEvent) => {
            if ((event.target as HTMLElement).closest('a')) return;
            void router.push(href);
          },
        }
      : {};
}

function NameLink({ href, className, children }: { href?: string; className?: string; children: React.ReactNode }) {
  if (!href) return <span className={className}>{children}</span>;
  return (
    <Link
      className={cn(
        className,
        'rounded-sm outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50'
      )}
      href={href}
    >
      {children}
    </Link>
  );
}

function ErrorRow({ colSpan, onRetry }: { colSpan: number; onRetry(): void }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell className="py-4 pl-4" colSpan={colSpan}>
        <span className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Icon className="text-destructive" icon="IconAlertTriangle" size="s" />
            Podaci se nisu učitali.
          </span>
          <Button size="sm" variant="outline" onClick={onRetry}>
            <Icon data-icon="inline-start" icon="IconRefresh" size="s" /> Pokušaj ponovno
          </Button>
        </span>
      </TableCell>
    </TableRow>
  );
}

export interface RankingRow {
  id: string;
  name: string;
  detail?: string;
  href?: string;
  count: number;
  revenue: number;
}

/** Top N by revenue with each one's share of these N (Klijenti, Vozači, Vozila). */
export function RankingTable({
  title,
  entity,
  rows,
  mono,
  dim,
  isLoading,
  onRetry,
}: {
  title: string;
  entity: string;
  rows: RankingRow[];
  /** Registrations in Geist Mono. */
  mono?: boolean;
  dim?: boolean;
  isLoading?: boolean;
  /** Set when the list failed to load: an error row with „Pokušaj ponovno”. */
  onRetry?(): void;
}) {
  const openRow = useOpenRow();
  const total = rows.reduce((sum, row) => sum + row.revenue, 0);
  return (
    <Panel
      action={rows.length > 0 && <span className="text-xs text-muted-foreground">Top {rows.length}, po prihodu</span>}
      bodyClassName="p-0"
      className={cn('min-w-0 transition-opacity', dim && 'opacity-50')}
      title={title}
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4">{entity}</TableHead>
            <TableHead className="text-right">Nalozi</TableHead>
            <TableHead className="text-right">Prihod</TableHead>
            <TableHead className="pr-4 text-right">
              <Tooltip>
                <TooltipTrigger
                  render={<span className="cursor-help underline decoration-dotted underline-offset-4" />}
                >
                  Udio
                </TooltipTrigger>
                <TooltipContent>Udio u prihodu ovih {rows.length}</TooltipContent>
              </Tooltip>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {onRetry ? (
            <ErrorRow colSpan={4} onRetry={onRetry} />
          ) : isLoading ? (
            <SkeletonRows colSpan={4} />
          ) : rows.length === 0 ? (
            <EmptyRow colSpan={4} />
          ) : (
            rows.map((row) => (
              <TableRow key={row.id} {...openRow(row.href)}>
                <TableCell className="py-2.5 pl-4">
                  <span className="flex flex-col">
                    <NameLink className={cn('w-fit font-medium', mono && 'font-mono')} href={row.href}>
                      {row.name}
                    </NameLink>
                    {row.detail && <span className="text-xs text-muted-foreground">{row.detail}</span>}
                  </span>
                </TableCell>
                <TableCell className="py-2.5 text-right tabular-nums">{int(row.count)}</TableCell>
                <TableCell className="py-2.5 text-right tabular-nums">{eur(row.revenue)}</TableCell>
                <TableCell className="py-2.5 pr-4">
                  <ShareBar share={total > 0 ? (row.revenue / total) * 100 : 0} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Panel>
  );
}

export interface ContractorRow {
  id: string;
  name: string;
  href?: string;
  count: number;
  revenue: number;
  cost: number;
  margin: number;
}

/** Kontraktori by RUC; a loss in red with „Gubitak N %”. */
export function ContractorsTable({
  rows,
  dim,
  isLoading,
  onRetry,
}: {
  rows: ContractorRow[];
  dim?: boolean;
  isLoading?: boolean;
  /** Set when the list failed to load: an error row with „Pokušaj ponovno”. */
  onRetry?(): void;
}) {
  const openRow = useOpenRow();
  const sorted = [...rows].sort((a, b) => b.margin - a.margin);
  return (
    <Panel
      action={<span className="text-xs text-muted-foreground">Po RUC-u</span>}
      bodyClassName="p-0"
      className={cn('min-w-0 transition-opacity', dim && 'opacity-50')}
      title="Kontraktori"
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-4">Kontraktor</TableHead>
            <TableHead className="text-right">Nalozi</TableHead>
            <TableHead className="text-right">Prihod</TableHead>
            <TableHead className="text-right">Trošak</TableHead>
            <TableHead className="text-right">RUC</TableHead>
            <TableHead className="pr-4 text-right">Marža</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {onRetry ? (
            <ErrorRow colSpan={6} onRetry={onRetry} />
          ) : isLoading ? (
            <SkeletonRows colSpan={6} />
          ) : sorted.length === 0 ? (
            <EmptyRow colSpan={6} />
          ) : (
            sorted.map((row) => {
              const share = row.revenue ? (row.margin / row.revenue) * 100 : undefined;
              return (
                <TableRow key={row.id} {...openRow(row.href)}>
                  <TableCell className="py-2.5 pl-4 font-medium">
                    <NameLink href={row.href}>{row.name}</NameLink>
                  </TableCell>
                  <TableCell className="py-2.5 text-right tabular-nums">{int(row.count)}</TableCell>
                  <TableCell className="py-2.5 text-right tabular-nums">{eur(row.revenue)}</TableCell>
                  <TableCell className="py-2.5 text-right tabular-nums">{eur(row.cost)}</TableCell>
                  <TableCell
                    className={cn('py-2.5 text-right font-medium tabular-nums', row.margin < 0 && 'text-destructive')}
                  >
                    {row.margin < 0 ? '−' : ''}
                    {eur(Math.abs(row.margin))}
                  </TableCell>
                  <TableCell className="py-2.5 pr-4 text-right tabular-nums">
                    {share === undefined ? (
                      '—'
                    ) : row.margin < 0 ? (
                      <Badge size="sm" tone="danger">
                        Gubitak {percent(Math.abs(share))}
                      </Badge>
                    ) : (
                      percent(share)
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Panel>
  );
}
