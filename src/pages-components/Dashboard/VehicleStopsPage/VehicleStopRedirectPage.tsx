import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { useVehicleStop } from '@/lib/hooks/api/vehicleStops';
import { Icon } from '@/ui';

import { routeHref } from './routes';

/**
 * The old single-stop URL (/dashboard/vehicle-stops/stop/[id], e.g. from a notification): looks up the stop's vehicle
 * and replaces itself with that vehicle's Ruta, scrolled to the stop and highlighted.
 */
export const VehicleStopRedirectPage = () => {
  const router = useRouter();
  const stopId = typeof router.query.stopId === 'string' ? router.query.stopId : undefined;
  const { data: stop, isError } = useVehicleStop(stopId);

  useEffect(() => {
    if (!stop) return;
    void router.replace(routeHref(stop.vehicleId, stop.id));
  }, [stop, router]);

  return (
    <DashboardLayout>
      {isError ? (
        <Empty className="min-h-80">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon icon="IconMapPinOff" size="m" />
            </EmptyMedia>
            <EmptyTitle>Utovar / istovar nije pronađen</EmptyTitle>
            <EmptyDescription>Možda je obrisan.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button nativeButton={false} render={<Link href="/dashboard/vehicle-stops" />} variant="outline">
              Prijevozi
            </Button>
          </EmptyContent>
        </Empty>
      ) : (
        <div className="flex min-h-80 items-center justify-center text-muted-foreground">
          <Spinner className="size-5" />
        </div>
      )}
    </DashboardLayout>
  );
};
