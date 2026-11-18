import { useMemo } from 'react';

import { CountryFlag } from '@/components/shared/country-flag';
import { STOP_KIND, StopKindDot } from '@/components/shared/stop-kind';
import type { VehicleStop } from '@/lib/api/vehicleStops';
import { useEmployees } from '@/lib/hooks/api';
import { cn } from '@/lib/utils';
import { formatDateShort } from '@/lib/utils/date';

import { isDone, kindsOf, placeOnly } from './stops';

/** UTOVAR / ISTOVAR in their colours (both for a stop that does both); grey when finished or `muted`. */
export function StopKinds({ stop, muted, className }: { stop: VehicleStop; muted?: boolean; className?: string }) {
  const kinds = kindsOf(stop);
  if (kinds.length === 0) return null;
  return (
    <span className={cn('flex items-center gap-1 text-xs font-medium tracking-wide uppercase', className)}>
      {kinds.map((kind, index) => (
        <span className={muted ? 'text-muted-foreground' : STOP_KIND[kind].text} key={kind}>
          {index > 0 && <span className="text-muted-foreground">· </span>}
          {STOP_KIND[kind].label}
        </span>
      ))}
    </span>
  );
}

/** The stop's dot(s); a stop that loads and unloads gets both. */
export function StopDots({ stop, className }: { stop: VehicleStop; className?: string }) {
  const kinds = kindsOf(stop);
  if (kinds.length === 0)
    return <span aria-hidden className={cn('size-2 shrink-0 rounded-full bg-border', className)} />;
  return (
    <>
      {kinds.map((kind) => (
        <StopKindDot className={className} done={isDone(stop)} key={kind} kind={kind} />
      ))}
    </>
  );
}

/** „Bez datuma” in red, else „7.11.”. */
export function StopDate({ stop, className }: { stop: VehicleStop; className?: string }) {
  return (
    <span className={cn('text-xs tabular-nums', stop.date ? 'text-muted-foreground' : 'text-destructive', className)}>
      {stop.date ? formatDateShort(stop.date) : 'Bez datuma'}
    </span>
  );
}

/** Kind + flag + place, the date under it (lab `StopLine`). */
export function StopLine({ stop, muted }: { stop: VehicleStop; muted?: boolean }) {
  return (
    <span className="flex min-w-0 flex-col">
      <span className="flex min-w-0 items-center gap-1.5">
        <StopKinds muted={muted} stop={stop} />
        {stop.address?.countryCode && <CountryFlag code={stop.address.countryCode} size="xxs" />}
        <span className={cn('truncate', muted && 'text-muted-foreground')}>{placeOnly(stop)}</span>
      </span>
      <StopDate stop={stop} />
    </span>
  );
}

/** Employee id → full name (deleted employees included, old stops may point at them). */
export function useEmployeeNames() {
  const { data: employees } = useEmployees({ includeDeleted: true });
  return useMemo(() => {
    const names = new Map<string, string>();
    employees?.forEach((employee) => names.set(employee.id.toString(), employee.fullName));
    return names;
  }, [employees]);
}
