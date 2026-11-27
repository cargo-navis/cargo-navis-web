import dayjs from 'dayjs';
import Link from 'next/link';
import * as React from 'react';

import { STOP_KIND } from '@/components/shared/stop-kind';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Icon } from '@/ui';

import { startOfWeek, todayKey, weekDays, weekLabel } from './routeFacts';
import { routeHref, type VehicleRoute } from './routes';
import { StopDots } from './StopLine';
import { chronological, isDone, placeOnly } from './stops';

const COLUMNS = 'grid-cols-[10rem_repeat(7,minmax(7rem,1fr))_minmax(7rem,1fr)]';

/**
 * Tjedan (lab /transports `WeekBoard`): vehicles × Pon–Ned + „Bez datuma”, a chip per utovar / istovar with its kind
 * dot (✓ when finished), today tinted, ‹ › week.
 */
export function WeekBoard({
  routes,
  driverName,
  empty,
  className,
}: {
  routes: VehicleRoute[];
  driverName(id: string | null): string | undefined;
  empty?: React.ReactNode;
  className?: string;
}) {
  const [monday, setMonday] = React.useState(() => startOfWeek(dayjs()));
  const days = weekDays(monday);
  const today = todayKey();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Button
          aria-label="Prethodni tjedan"
          size="icon-sm"
          variant="outline"
          onClick={() => setMonday((current) => current.subtract(1, 'week'))}
        >
          <Icon icon="IconChevronLeft" size="s" />
        </Button>
        <span className="text-sm font-medium tabular-nums">{weekLabel(monday)}</span>
        <Button
          aria-label="Sljedeći tjedan"
          size="icon-sm"
          variant="outline"
          onClick={() => setMonday((current) => current.add(1, 'week'))}
        >
          <Icon icon="IconChevronRight" size="s" />
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setMonday(startOfWeek(dayjs()))}>
          Ovaj tjedan
        </Button>
      </div>
      <div className={cn('overflow-x-auto rounded-xl border', className)}>
        <div className={cn('grid min-w-[64rem]', COLUMNS)}>
          <div className="border-b bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">Vozilo</div>
          {days.map((day) => (
            <div
              className={cn(
                'border-b border-l bg-muted px-3 py-2 text-xs font-medium',
                day.key === today ? 'text-brand' : 'text-muted-foreground'
              )}
              key={day.key}
            >
              {day.name} {day.day.date()}.{day.day.month() + 1}.{day.key === today && ' · danas'}
            </div>
          ))}
          <div className="border-b border-l bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
            Bez datuma
          </div>
          {routes.length === 0 && <div className="col-span-full">{empty}</div>}
          {routes.map((route) => {
            const driver = driverName(route.facts.driverId);
            const ordered = chronological(route.stops);
            return (
              <React.Fragment key={route.vehicleId}>
                <Link
                  className="flex min-w-0 flex-col border-b px-3 py-2 text-left hover:bg-muted/50"
                  href={routeHref(route.vehicleId)}
                >
                  <span className="font-mono text-sm font-medium">{route.registration}</span>
                  <span className={cn('truncate text-xs', driver ? 'text-muted-foreground' : 'text-destructive')}>
                    {driver ?? 'Bez vozača'}
                  </span>
                </Link>
                {[...days.map((day) => day.key), 'none'].map((key) => {
                  const stops = ordered.filter((stop) =>
                    key === 'none' ? !stop.date : !!stop.date && dayjs(stop.date).format('YYYY-MM-DD') === key
                  );
                  return (
                    <div
                      className={cn(
                        'flex min-w-0 flex-col gap-1 border-b border-l p-1.5',
                        key === today && 'bg-primary/5 dark:bg-primary/10'
                      )}
                      key={key}
                    >
                      {stops.map((stop) => (
                        <Link
                          className={cn(
                            'flex min-w-0 items-center gap-1.5 rounded-md border bg-card px-2 py-1 text-left text-xs hover:bg-muted/60',
                            isDone(stop) && 'text-muted-foreground',
                            key === 'none' && 'border-dashed border-destructive/60'
                          )}
                          href={routeHref(route.vehicleId, stop.id)}
                          key={stop.id}
                        >
                          {isDone(stop) ? (
                            <Icon className="size-3! [&_svg]:size-full!" icon="IconCheck" size="xs" />
                          ) : (
                            <StopDots stop={stop} />
                          )}
                          <span className="truncate">{placeOnly(stop)}</span>
                        </Link>
                      ))}
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
      <span className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className={cn('size-2 rounded-full', STOP_KIND.loading.dot)} /> Utovar
        </span>
        <span className="flex items-center gap-1.5">
          <span className={cn('size-2 rounded-full', STOP_KIND.unloading.dot)} /> Istovar
        </span>
        <span className="flex items-center gap-1.5">
          <Icon className="size-3! [&_svg]:size-full!" icon="IconCheck" size="xs" /> Završeno
        </span>
      </span>
    </div>
  );
}
