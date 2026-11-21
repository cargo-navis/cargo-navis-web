import Link from 'next/link';
import { useRouter } from 'next/router';
import type * as React from 'react';

import { TableLoadingRow } from '@/components/shared/loading';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { formatDateShort } from '@/lib/utils/date';
import { pluralCount } from '@/lib/utils/plural';
import { Icon } from '@/ui';

import { routeHref, type VehicleRoute } from './routes';
import { StopLine } from './StopLine';

const COLUMNS = 5;

/** Tablica (default list view, lab /transports `StatusTable`): Vozilo / vozač · Sada · Sljedeće · Plan · Treba pažnju. */
export function StatusTable({
  routes,
  driverName,
  showFetching,
  empty,
  bodyClassName,
}: {
  routes: VehicleRoute[];
  driverName(id: string | null): string | undefined;
  showFetching: boolean;
  /** Shown inside the table under its header when there are no rows. */
  empty?: React.ReactNode;
  bodyClassName?: string;
}) {
  const router = useRouter();
  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted hover:bg-muted">
            <TableHead>Vozilo</TableHead>
            <TableHead>Sada</TableHead>
            <TableHead>Sljedeće</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Treba pažnju</TableHead>
          </TableRow>
          <TableLoadingRow colSpan={COLUMNS} show={showFetching} />
        </TableHeader>
        <TableBody className={bodyClassName}>
          {routes.length === 0 && empty && (
            <TableRow className="hover:bg-transparent">
              <TableCell className="p-0" colSpan={COLUMNS}>
                {empty}
              </TableCell>
            </TableRow>
          )}
          {routes.map((route) => {
            const { facts } = route;
            const driver = driverName(facts.driverId);
            return (
              <TableRow
                className="cursor-pointer align-top"
                key={route.vehicleId}
                onClick={() => void router.push(routeHref(route.vehicleId))}
              >
                <TableCell className="py-3">
                  <span className="flex flex-col">
                    <Link
                      className="w-fit font-mono font-medium hover:underline"
                      href={routeHref(route.vehicleId)}
                      onClick={(event) => event.stopPropagation()}
                    >
                      {route.registration}
                    </Link>
                    <span className={cn('text-xs', driver ? 'text-muted-foreground' : 'text-destructive')}>
                      {driver ?? 'Bez vozača'}
                    </span>
                  </span>
                </TableCell>
                <TableCell className="py-3">
                  {facts.lastDone ? (
                    <span className="flex items-start gap-1.5">
                      <Icon className="mt-0.5 text-muted-foreground" icon="IconCircleCheck" size="s" />
                      <StopLine muted stop={facts.lastDone} />
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell
                  className="py-3"
                  onClick={(event) => {
                    if (!facts.next) return;
                    event.stopPropagation();
                    void router.push(routeHref(route.vehicleId, facts.next.id));
                  }}
                >
                  {facts.next ? (
                    <StopLine stop={facts.next} />
                  ) : (
                    <span className="text-muted-foreground">Ništa planirano</span>
                  )}
                </TableCell>
                <TableCell className="py-3 text-sm">
                  {facts.rest > 0 ? (
                    <span>
                      još {facts.rest}
                      {facts.until && (
                        <span className="text-muted-foreground"> · do {formatDateShort(facts.until)}</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="py-3">
                  <AttentionBadges facts={facts} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

/** „1 nije obaviješten · 2 nisu obaviještena · 5 nije obaviješteno” (utovari / istovari, masculine). */
function notNotifiedLabel(count: number) {
  return pluralCount(count, ['nije obaviješten', 'nisu obaviještena', 'nije obaviješteno']);
}

function AttentionBadges({ facts }: { facts: VehicleRoute['facts'] }) {
  if (facts.noDriver + facts.noDate + facts.notNotified === 0) return <span className="text-muted-foreground">—</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {facts.noDriver > 0 && (
        <Badge size="sm" tone="danger">
          Bez vozača
        </Badge>
      )}
      {facts.noDate > 0 && (
        <Badge size="sm" tone="danger">
          {facts.noDate} bez datuma
        </Badge>
      )}
      {facts.notNotified > 0 && (
        <Badge size="sm" tone="warning">
          {notNotifiedLabel(facts.notNotified)}
        </Badge>
      )}
    </span>
  );
}
