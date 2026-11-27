import Link from 'next/link';
import { useRouter } from 'next/router';

import { CRUMBS, DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { EntityNotFound } from '@/components/shared/not-found';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { VehicleEnum } from '@/lib/api';
import { useVehicle } from '@/lib/hooks';
import { Icon } from '@/ui';

import { fleetListHref, TYPE_OF, typeFromSlug, vehicleHref } from '../fleet';
import { VehicleForm } from './VehicleForm';

/** Novo vozilo: /dashboard/fleet/new?vrsta=<slug> (the type preselected from „Dodaj …”; tegljač when missing). */
export const NewVehiclePage = () => {
  const router = useRouter();
  const type = typeFromSlug(router.query.vrsta) ?? VehicleEnum.TRUCK;

  return (
    <DashboardLayout breadcrumbs={[CRUMBS.fleet, { label: 'Novo vozilo' }]}>
      <PageTitle title="Novo vozilo" />
      <div className="flex flex-col gap-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Novo vozilo</h1>
        {/* Wait for the query so the preselected type is right on the first render. */}
        {router.isReady && <VehicleForm initialType={type} key={type} />}
      </div>
    </DashboardLayout>
  );
};

/** Uredi vozilo: /dashboard/fleet/[id]/edit. */
export const EditVehiclePage = () => {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : '';
  const { data: vehicle, isPending, isError } = useVehicle(id);
  const loading = !router.isReady || (isPending && !isError);

  const crumbs = vehicle
    ? [
        CRUMBS.fleet,
        { label: TYPE_OF[vehicle.type].plural, href: fleetListHref(vehicle.type) },
        { label: vehicle.registration, href: vehicleHref(vehicle.id) },
        { label: 'Uredi' },
      ]
    : [CRUMBS.fleet, { label: 'Uredi vozilo' }];

  return (
    <DashboardLayout breadcrumbs={crumbs}>
      <PageTitle title={vehicle?.registration} type="Uredi vozilo" />
      {loading ? (
        <div aria-busy className="flex max-w-3xl flex-col gap-6">
          <Skeleton className="h-9 w-72" />
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton className="h-40 rounded-xl" key={index} />
          ))}
        </div>
      ) : isError && !vehicle ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon icon="IconTruck" size="m" />
            </EmptyMedia>
            <EmptyTitle>Vozilo se nije učitalo</EmptyTitle>
            <EmptyDescription>Provjeri vezu i pokušaj ponovno.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button nativeButton={false} render={<Link href={fleetListHref()} />} variant="outline">
              <Icon data-icon="inline-start" icon="IconArrowLeft" size="s" /> Natrag na flotu
            </Button>
          </EmptyContent>
        </Empty>
      ) : !vehicle ? (
        <EntityNotFound kind="vehicle" />
      ) : (
        <div className="flex flex-col gap-6">
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Uredi: <span className="font-mono">{vehicle.registration}</span>
          </h1>
          <VehicleForm initialType={vehicle.type} key={vehicle.id} vehicle={vehicle} />
        </div>
      )}
    </DashboardLayout>
  );
};
