import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

import { CRUMBS, DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { ExpiryBadge } from '@/components/shared/expiry-badge';
import { Panel } from '@/components/shared/panel';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Vehicle } from '@/lib/api';
import { useVehicle } from '@/lib/hooks';
import { formatDate } from '@/lib/utils/date';
import { Icon } from '@/ui';

import {
  deadlineBannerItem,
  deadlinesOf,
  EQUIPMENT_LABEL,
  euroLabel,
  fleetListHref,
  formatDimensions,
  formatNumber,
  hasAdr,
  hasEngine,
  hasLoadSpace,
  loadLabel,
  oldListRedirect,
  problemsOf,
  specsOf,
  TYPE_OF,
  vehicleEditHref,
} from '../fleet';
import { DeleteVehicleDialog } from '../parts/DeleteVehicleDialog';
import { RecentStops } from './RecentStops';
import { VehicleFiles } from './VehicleFiles';

/**
 * Vozilo (DECISIONS §5 „Flota”, lab /fleet „Detalj”): registration + type, key specs as chips, Uredi / ⋯ Obriši;
 * banner of expired / soon deadlines; left Osnovno · Motor · Utovarni prostor, right Rokovi (one table by group),
 * Datoteke, Zadnji prijevozi (motor vehicles). One page for every type: /dashboard/fleet/[id].
 */
export const VehiclePage = () => {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : '';
  const redirectTo = oldListRedirect(id);
  const { data: vehicle, isPending, isError, refetch } = useVehicle(redirectTo ? '' : id);

  React.useEffect(() => {
    if (redirectTo) void router.replace(redirectTo);
  }, [redirectTo, router]);

  const loading = !router.isReady || !!redirectTo || (isPending && !isError);
  const crumbs = vehicle
    ? [
        CRUMBS.fleet,
        { label: TYPE_OF[vehicle.type].plural, href: fleetListHref(vehicle.type) },
        { label: vehicle.registration },
      ]
    : [CRUMBS.fleet, { label: 'Vozilo' }];

  return (
    <DashboardLayout breadcrumbs={crumbs}>
      <PageTitle title={vehicle?.registration} type={vehicle ? TYPE_OF[vehicle.type].singular : 'Vozilo'} />
      {loading ? (
        <VehicleSkeleton />
      ) : isError && !vehicle ? (
        <Missing
          action={
            <Button variant="outline" onClick={() => void refetch()}>
              <Icon data-icon="inline-start" icon="IconRefresh" size="s" /> Pokušaj ponovno
            </Button>
          }
          description="Provjeri vezu i pokušaj ponovno."
          title="Vozilo se nije učitalo"
        />
      ) : !vehicle ? (
        <Missing
          action={
            <Button nativeButton={false} render={<Link href={fleetListHref()} />} variant="outline">
              <Icon data-icon="inline-start" icon="IconArrowLeft" size="s" /> Natrag na flotu
            </Button>
          }
          description="Možda je obrisano ili poveznica nije ispravna."
          title="Vozilo nije pronađeno"
        />
      ) : (
        <VehicleDetail vehicle={vehicle} />
      )}
    </DashboardLayout>
  );
};

function VehicleDetail({ vehicle }: { vehicle: Vehicle }) {
  const router = useRouter();
  const [toDelete, setToDelete] = React.useState<Vehicle | null>(null);
  const deadlines = deadlinesOf(vehicle);
  const { expired, soon } = problemsOf(vehicle);
  const groups = Array.from(new Set(deadlines.map((deadline) => deadline.group)));
  const type = TYPE_OF[vehicle.type];
  const dash = <span className="text-muted-foreground">—</span>;
  const withUnit = (value: number | null | undefined, unit: string) => {
    const formatted = formatNumber(value);
    return formatted ? `${formatted} ${unit}` : dash;
  };
  const dimensions = formatDimensions(vehicle);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <Link
          className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          href={fleetListHref(vehicle.type)}
        >
          <Icon icon="IconArrowLeft" size="s" /> Flota
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1.5">
            <span className="flex items-center gap-3">
              <h1 className="font-mono text-3xl font-bold tracking-tight">{vehicle.registration}</h1>
              <Badge look="outline">{type.singular}</Badge>
            </span>
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              {[vehicle.brand, vehicle.manufacturingYear || undefined].filter(Boolean).join(' · ')}
              {specsOf(vehicle).map((spec) => (
                <Badge key={spec}>{spec}</Badge>
              ))}
              {hasAdr(vehicle) && (
                <Badge look="outline" tone="warning">
                  ADR
                </Badge>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button nativeButton={false} render={<Link href={vehicleEditHref(vehicle.id)} />}>
              <Icon data-icon="inline-start" icon="IconPencil" size="s" /> Uredi
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button aria-label="Više akcija" size="icon" variant="outline" />}>
                <Icon icon="IconDots" size="s" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem variant="destructive" onClick={() => setToDelete(vehicle)}>
                  <Icon icon="IconTrash" size="s" /> Obriši vozilo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {(expired.length > 0 || soon.length > 0) && (
        <Alert variant={expired.length ? 'destructive' : 'warning'}>
          <AlertTitle>{expired.length ? 'Istekli rokovi' : 'Rokovi istječu uskoro'}</AlertTitle>
          <AlertDescription>{[...expired, ...soon].map(deadlineBannerItem).join(' · ')}</AlertDescription>
        </Alert>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <Panel bodyClassName="py-1.5 divide-y" title="Osnovno">
            <Fact label="Marka">{vehicle.brand || dash}</Fact>
            <Fact label="Godina proizvodnje">{vehicle.manufacturingYear || dash}</Fact>
            <Fact label="Broj šasije">
              {vehicle.vehicleIdentificationNumber ? (
                <span className="font-mono text-xs">{vehicle.vehicleIdentificationNumber}</span>
              ) : (
                dash
              )}
            </Fact>
            <Fact label="Datum registracije">
              {vehicle.registrationDate ? formatDate(vehicle.registrationDate) : dash}
            </Fact>
            <Fact label="Broj osovina">{vehicle.numberOfAxles || dash}</Fact>
            <Fact label="Masa praznog vozila">{withUnit(vehicle.emptyWeight, 'kg')}</Fact>
          </Panel>
          {hasEngine(vehicle.type) && (
            <Panel bodyClassName="py-1.5 divide-y" title="Motor">
              <Fact label="Euro norma">{euroLabel(vehicle.emissionStandard) ?? dash}</Fact>
              <Fact label="Snaga">{withUnit(vehicle.enginePower, 'kW')}</Fact>
              <Fact label="Spremnik">{withUnit(vehicle.tankSize, 'l')}</Fact>
              <Fact label="Potrošnja">{withUnit(vehicle.averageFuelConsumption, 'l/100 km')}</Fact>
            </Panel>
          )}
          {hasLoadSpace(vehicle.type) && (
            <Panel bodyClassName="py-1.5 divide-y" title="Utovarni prostor">
              <Fact label="Vrsta">{loadLabel(vehicle.vehicleLoadType) ?? dash}</Fact>
              <Fact label="Kapacitet">{withUnit(vehicle.loadCapacity, 'kg')}</Fact>
              <Fact label="Dimenzije (D × Š × V)">{dimensions ? `${dimensions} m` : dash}</Fact>
              <Fact label="Rampa">{vehicle.ramp ? 'Da' : 'Ne'}</Fact>
              <div className="flex flex-col gap-2 py-2.5">
                <span className="text-sm text-muted-foreground">Oprema</span>
                {!vehicle.equipment?.length ? (
                  dash
                ) : (
                  <span className="flex flex-wrap gap-1.5">
                    {vehicle.equipment.map((item) => (
                      <Badge key={item} look="outline">
                        {EQUIPMENT_LABEL[item] ?? item}
                      </Badge>
                    ))}
                  </span>
                )}
              </div>
            </Panel>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Panel bodyClassName="p-0" title="Rokovi">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4">Rok</TableHead>
                  <TableHead>Vrijedi do</TableHead>
                  <TableHead className="pr-4 text-right">Stanje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <React.Fragment key={group}>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableCell className="py-1.5 pl-4 text-xs font-medium text-muted-foreground" colSpan={3}>
                        {group}
                      </TableCell>
                    </TableRow>
                    {deadlines
                      .filter((deadline) => deadline.group === group)
                      .map((deadline) => (
                        <TableRow key={deadline.key}>
                          <TableCell className="py-2.5 pl-4 font-medium">{deadline.label}</TableCell>
                          <TableCell className="py-2.5 tabular-nums">
                            {deadline.date ? formatDate(deadline.date) : dash}
                          </TableCell>
                          <TableCell className="py-2.5 pr-4 text-right">
                            <ExpiryBadge date={deadline.date} okLabel="U roku" />
                          </TableCell>
                        </TableRow>
                      ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </Panel>

          <VehicleFiles vehicle={vehicle} />

          {hasEngine(vehicle.type) && <RecentStops vehicle={vehicle} />}
        </div>
      </div>

      <DeleteVehicleDialog
        vehicle={toDelete}
        onDeleted={() => router.push(fleetListHref(vehicle.type))}
        onOpenChange={(open) => !open && setToDelete(null)}
      />
    </div>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm">{children}</span>
    </div>
  );
}

function Missing({ title, description, action }: { title: string; description: string; action: React.ReactNode }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon icon="IconTruck" size="m" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>{action}</EmptyContent>
    </Empty>
  );
}

/** First load: page-shaped skeleton (header, two columns of panels). */
function VehicleSkeleton() {
  return (
    <div aria-busy className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-5 w-80" />
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
