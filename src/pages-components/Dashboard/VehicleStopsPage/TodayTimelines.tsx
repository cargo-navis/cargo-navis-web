import Link from 'next/link';
import type * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Icon } from '@/ui';

import { pickTimeline } from './routeFacts';
import { routeHref, type VehicleRoute } from './routes';
import { StopDate, StopKinds } from './StopLine';
import { chronological, isDone, placeOnly } from './stops';

/**
 * Kao danas (lab /transports `TodayTimelines`): today's horizontal timeline per vehicle, restyled — up to 5 points (the
 * last finished one + what's next), place and date under each point, „+N” for the rest.
 */
export function TodayTimelines({
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
  return (
    <div className={cn('flex flex-col divide-y rounded-xl border bg-card', className)}>
      {routes.length === 0 && empty}
      {routes.map((route) => {
        const { shown, more } = pickTimeline(chronological(route.stops));
        const driver = driverName(route.facts.driverId);
        return (
          <div className="flex items-start gap-6 px-4 py-5" key={route.vehicleId}>
            <Link className="flex w-40 shrink-0 flex-col text-left" href={routeHref(route.vehicleId)}>
              <span className="font-mono text-base font-medium hover:underline">{route.registration}</span>
              {route.brand && <span className="text-xs text-muted-foreground">{route.brand}</span>}
              <span className={cn('text-xs', driver ? 'text-muted-foreground' : 'text-destructive')}>
                {driver ?? 'Bez vozača'}
              </span>
            </Link>
            {shown.length === 0 ? (
              <span className="text-sm text-muted-foreground">Ništa planirano</span>
            ) : (
              <ol className="flex min-w-0 flex-1">
                {shown.map((stop, index) => {
                  const done = isDone(stop);
                  const nextDone = !!shown[index + 1] && isDone(shown[index + 1]);
                  return (
                    <li className="flex min-w-0 flex-1 flex-col gap-1.5" key={stop.id}>
                      <span className="flex items-center">
                        <span
                          className={cn(
                            'flex size-5 shrink-0 items-center justify-center rounded-full border-2',
                            done
                              ? 'border-primary bg-primary text-primary-foreground dark:border-teal-500 dark:bg-teal-500'
                              : 'border-muted-foreground/40 bg-card'
                          )}
                        >
                          {done && <Icon className="size-3! [&_svg]:size-full!" icon="IconCheck" size="xs" />}
                        </span>
                        {(index < shown.length - 1 || more > 0) && (
                          <span
                            className={cn(
                              'h-0.5 flex-1',
                              done && nextDone
                                ? 'bg-primary dark:bg-teal-500'
                                : 'border-t-2 border-dashed border-muted-foreground/30'
                            )}
                          />
                        )}
                      </span>
                      <Link className="flex min-w-0 flex-col pr-2 text-left" href={routeHref(route.vehicleId, stop.id)}>
                        <StopKinds className="text-[0.6875rem]" stop={stop} />
                        <span className="truncate text-sm font-medium">{placeOnly(stop)}</span>
                        <StopDate stop={stop} />
                      </Link>
                    </li>
                  );
                })}
                {more > 0 && (
                  <li className="flex shrink-0 items-start">
                    <Badge size="sm">+{more}</Badge>
                  </li>
                )}
              </ol>
            )}
          </div>
        );
      })}
    </div>
  );
}
