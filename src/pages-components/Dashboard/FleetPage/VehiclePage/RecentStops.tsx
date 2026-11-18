import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { CountryFlag } from '@/components/shared/country-flag';
import { Panel } from '@/components/shared/panel';
import { STOP_KIND, type StopKind } from '@/components/shared/stop-kind';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import type { Vehicle } from '@/lib/api';
import { getVehicleStops, type VehicleStop } from '@/lib/api/vehicleStops';
import { useEmployees, useVehicles } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { formatDateShort } from '@/lib/utils/date';
import { isStopCompleted } from '@/lib/utils/vehicleStops';
import { Icon } from '@/ui';

import { vehicleRouteHref } from '../fleet';

const RECENT_STOPS = 5;

/**
 * Zadnji prijevozi (lab /fleet, motor vehicles only): the vehicle's last 5 utovari / istovari from today's paginated
 * GET /api/vehicle-stops?vehicleId= (newest first, as the vehicle's Ruta page). Row = that stop on the Ruta page.
 */
export function RecentStops({ vehicle }: { vehicle: Vehicle }) {
  const router = useRouter();
  const { data, isPending, isError, refetch } = useQuery({
    // Under 'vehicleStops' so every stop mutation (which invalidates that key) refreshes it too.
    queryKey: ['vehicleStops', 'recent', vehicle.id, RECENT_STOPS],
    queryFn: () => getVehicleStops({ vehicleId: vehicle.id, page: 1, size: RECENT_STOPS }),
  });
  const { data: employees } = useEmployees({ includeDeleted: true });
  const { data: vehicles } = useVehicles();
  const stops = data?.data ?? [];

  const driverName = (id: string | null) => (id ? employees?.find((employee) => employee.id === id)?.fullName : null);
  const trailer = (id: string | null) => (id ? vehicles?.find((other) => other.id === id)?.registration : null);
  const openStop = (stop: VehicleStop) =>
    void router.push(`${vehicleRouteHref(vehicle.id)}?highlight=${encodeURIComponent(stop.id)}`);

  let body: React.ReactNode;
  if (isPending) {
    body = (
      <div className="flex flex-col gap-3 p-4">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton className="h-5 w-full" key={index} />
        ))}
      </div>
    );
  } else if (isError) {
    body = (
      <div className="flex items-center justify-between gap-3 p-4 text-sm text-muted-foreground">
        Prijevozi se nisu učitali.
        <Button size="sm" variant="outline" onClick={() => void refetch()}>
          Pokušaj ponovno
        </Button>
      </div>
    );
  } else if (stops.length === 0) {
    body = <p className="p-4 text-sm text-muted-foreground">Vozilo još nema utovara ni istovara.</p>;
  } else {
    body = (
      <Table>
        <TableBody>
          {stops.map((stop) => {
            const done = isStopCompleted(stop);
            const kinds: StopKind[] = [
              ...(stop.loadingCargos.length > 0 ? (['loading'] as const) : []),
              ...(stop.unloadingCargos.length > 0 ? (['unloading'] as const) : []),
            ];
            return (
              <TableRow className="cursor-pointer" key={stop.id} onClick={() => openStop(stop)}>
                <TableCell className="w-16 py-3 pl-4 text-muted-foreground tabular-nums">
                  {stop.date ? formatDateShort(stop.date) : '–'}
                </TableCell>
                <TableCell className="py-3">
                  {stop.address ? (
                    <span className="flex items-center gap-2">
                      {stop.address.countryCode && <CountryFlag code={stop.address.countryCode} size="xxs" />}
                      {[stop.address.postalCode, stop.address.placeName].filter(Boolean).join(' ')}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Bez adrese</span>
                  )}
                </TableCell>
                <TableCell className="py-3">
                  {kinds.map((kind, index) => (
                    <span className={done ? 'text-muted-foreground' : STOP_KIND[kind].text} key={kind}>
                      {index > 0 && ' · '}
                      {STOP_KIND[kind].label}
                    </span>
                  ))}
                </TableCell>
                <TableCell className="py-3">
                  {driverName(stop.driverId) ?? <span className="text-muted-foreground">Bez vozača</span>}
                </TableCell>
                <TableCell className="py-3 font-mono text-xs text-muted-foreground">
                  {trailer(stop.trailerId) ?? ''}
                </TableCell>
                <TableCell className="w-10 py-3 pr-4 text-right">
                  {done && (
                    <span className="flex justify-end" title="Završeno">
                      <Icon className={cn('text-muted-foreground')} icon="IconCheck" size="s" />
                      <span className="sr-only">Završeno</span>
                    </span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  }

  return (
    <Panel
      action={
        <Button nativeButton={false} render={<Link href={vehicleRouteHref(vehicle.id)} />} size="sm" variant="ghost">
          Svi prijevozi vozila <Icon data-icon="inline-end" icon="IconExternalLink" size="s" />
        </Button>
      }
      bodyClassName="p-0"
      title="Zadnji prijevozi"
    >
      {body}
    </Panel>
  );
}
