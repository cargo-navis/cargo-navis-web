import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

import { CRUMBS, DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { CountryFlag } from '@/components/shared/country-flag';
import { ExpiryBadge } from '@/components/shared/expiry-badge';
import { EntityNotFound } from '@/components/shared/not-found';
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
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Employee } from '@/lib/api/employees.d';
import { useClients, useEmployee, useResendEmployeeInvite, useShipments } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { getCountryName } from '@/lib/utils/countries';
import { formatDate } from '@/lib/utils/date';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { dateOf, routeOf } from '@/pages-components/Dashboard/ClientsPage/SingleClientPage/ClientOrders';
import {
  deadlinesOf,
  employeeEditHref,
  fullName,
  hasWhatsApp,
  isDriver,
  POSITION_LABEL,
  POSITION_ORDER,
} from '@/pages-components/Dashboard/EmployeesPage/employees';
import {
  AppState,
  DeactivateDialog,
  EmployeeInitials,
  InviteDialog,
  LicenceCategories,
} from '@/pages-components/Dashboard/EmployeesPage/parts';
import { PhoneBackLink } from '@/pages-components/Dashboard/Partners/PartnerDetail';
import { CopyValue, Dash, Fact } from '@/pages-components/Dashboard/Partners/parts';
import { Icon } from '@/ui';

import { EmployeeFiles } from './EmployeeFiles';

/** Zaposlenik detail (lab /employees „Detalj”, DECISIONS §5). */
export const SingleEmployeePage = () => {
  const { query } = useRouter();
  const id = query.id as string | undefined;
  const { data: employee, isLoading, isError, refetch } = useEmployee(id ?? '');

  return (
    <DashboardLayout breadcrumbs={employee ? [CRUMBS.employees, { label: fullName(employee) }] : undefined}>
      <PageTitle title={employee ? fullName(employee) : undefined} type="Zaposlenik" />
      {employee ? (
        <EmployeeDetail employee={employee} />
      ) : isLoading || !id ? (
        <DetailSkeleton />
      ) : isError ? (
        <div className="rounded-xl border">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="danger">
                <Icon icon="IconAlertTriangle" size="m" />
              </EmptyMedia>
              <EmptyTitle>Podaci se nisu učitali</EmptyTitle>
              <EmptyDescription>Provjeri vezu i pokušaj ponovno.</EmptyDescription>
            </EmptyHeader>
            <Button variant="outline" onClick={() => void refetch()}>
              <Icon data-icon="inline-start" icon="IconRefresh" size="s" /> Pokušaj ponovno
            </Button>
          </Empty>
        </div>
      ) : (
        <EntityNotFound kind="employee" />
      )}
    </DashboardLayout>
  );
};

function DetailSkeleton() {
  return (
    <div aria-busy className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Skeleton className="size-14 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-40" />
        </div>
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    </div>
  );
}

function EmployeeDetail({ employee }: { employee: Employee }) {
  const [inviting, setInviting] = React.useState<Employee | null>(null);
  const [deactivating, setDeactivating] = React.useState<Employee | null>(null);
  const driver = isDriver(employee);
  const deadlines = deadlinesOf(employee);
  const expired = deadlines.filter((deadline) => deadline.state === 'expired');
  const soon = deadlines.filter((deadline) => deadline.state === 'soon');
  const groups = Array.from(new Set(deadlines.map((deadline) => deadline.group)));
  const licences = employee.driverLicenceCategories ?? [];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <PhoneBackLink href="/dashboard/employees" label="Zaposlenici" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <EmployeeInitials employee={employee} size="lg" />
            <div className="flex min-w-0 flex-col gap-1">
              <h1 className="font-heading text-3xl font-bold tracking-tight">{fullName(employee)}</h1>
              <span className="flex flex-wrap items-center gap-1.5">
                {POSITION_ORDER.filter((position) => employee.positions.includes(position)).map((position) => (
                  <Badge key={position} look="outline">
                    {POSITION_LABEL[position]}
                  </Badge>
                ))}
                {/* What a dispatcher checks first when picking a driver: licence categories (+ ADR). */}
                {licences.length > 0 && (
                  <>
                    <span className="mx-1 h-4 w-px bg-border" />
                    <span className="text-xs text-muted-foreground">Kategorije</span>
                    <LicenceCategories adr={!!employee.adrExpiryDate} licences={licences} />
                  </>
                )}
              </span>
            </div>
          </div>
          {!employee.deleted && (
            <div className="flex flex-wrap items-center gap-2">
              {driver && (
                <Button variant="outline" onClick={() => setInviting(employee)}>
                  <Icon data-icon="inline-start" icon="IconLink" size="s" /> Pozivnica za aplikaciju
                </Button>
              )}
              <Button nativeButton={false} render={<Link href={employeeEditHref(employee.id)} />}>
                <Icon data-icon="inline-start" icon="IconPencil" size="s" /> Uredi
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button aria-label="Više akcija" size="icon" variant="outline" />}>
                  <Icon icon="IconDots" size="s" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem variant="destructive" onClick={() => setDeactivating(employee)}>
                    <Icon icon="IconUserOff" size="s" /> Deaktiviraj
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </header>

      {employee.deleted && (
        <Alert icon="IconUserOff">
          <AlertTitle>Zaposlenik je deaktiviran</AlertTitle>
          <AlertDescription>
            Ne može se prijaviti ni biti dodijeljen nalozima. Podaci su samo za pregled.
          </AlertDescription>
        </Alert>
      )}

      {!employee.deleted && (expired.length > 0 || soon.length > 0) && (
        <Alert variant={expired.length ? 'destructive' : 'warning'}>
          <AlertTitle>{expired.length ? 'Istekle isprave' : 'Isprave istječu uskoro'}</AlertTitle>
          <AlertDescription>
            {[
              ...expired.map((deadline) => `${deadline.label} (isteklo ${formatDate(deadline.date!)})`),
              ...soon.map((deadline) => `${deadline.label} (do ${formatDate(deadline.date!)})`),
            ].join(' · ')}
          </AlertDescription>
        </Alert>
      )}

      <div
        className={cn('grid items-start gap-6 xl:grid-cols-[380px_minmax(0,1fr)]', employee.deleted && 'opacity-60')}
      >
        <div className="flex min-w-0 flex-col gap-6">
          <Panel bodyClassName="py-1.5 divide-y" title="Kontakt">
            <Fact label="Telefon">
              {employee.phoneNumber ? (
                <span className="flex flex-wrap items-center gap-2">
                  <a
                    className="flex items-center gap-1.5 tabular-nums hover:underline"
                    href={`tel:${employee.phoneNumber}`}
                  >
                    <Icon className="text-muted-foreground" icon="IconPhone" size="s" /> {employee.phoneNumber}
                  </a>
                  {hasWhatsApp(employee) && (
                    <Badge size="sm" tone="success">
                      <Icon icon="IconBrandWhatsapp" size="xs" /> WhatsApp
                    </Badge>
                  )}
                </span>
              ) : (
                <Dash />
              )}
            </Fact>
            <Fact label="Email">
              {employee.email ? (
                <span className="flex flex-col gap-1.5">
                  <a
                    className="flex min-w-0 items-center gap-1.5 text-brand hover:underline"
                    href={`mailto:${employee.email}`}
                  >
                    <Icon className="shrink-0" icon="IconMail" size="s" />
                    <span className="truncate">{employee.email}</span>
                  </a>
                  {/* Web app account: after the account is created, an email asks them to set a password. */}
                  {!employee.hasSetPassword && !employee.deleted && <ResendInvite employee={employee} />}
                </span>
              ) : (
                <Dash />
              )}
            </Fact>
          </Panel>

          {driver && (
            <Panel title="Aplikacija za vozače">
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <Icon className="mt-0.5 shrink-0 text-muted-foreground" icon="IconDeviceMobile" size="m" />
                  <span className="text-sm text-muted-foreground">
                    Vozač se prijavljuje linkom iz pozivnice (vrijedi 14 dana) i u aplikaciji vidi svoje naloge.
                  </span>
                </div>
                {hasWhatsApp(employee) && (
                  <span>
                    <AppState employee={employee} />
                  </span>
                )}
                {!employee.deleted && (
                  <Button className="w-fit" size="sm" variant="outline" onClick={() => setInviting(employee)}>
                    <Icon data-icon="inline-start" icon="IconLink" size="s" /> Generiraj pozivnicu
                  </Button>
                )}
              </div>
            </Panel>
          )}

          <Panel bodyClassName="py-1.5 divide-y" title="Osobni podaci">
            <Fact label="Datum rođenja">{employee.dateOfBirth ? formatDate(employee.dateOfBirth) : <Dash />}</Fact>
            <Fact label="Adresa">{employee.residenceAddress || <Dash />}</Fact>
            <Fact label="Državljanstvo">
              {employee.nationality ? (
                <span className="flex items-center gap-1.5">
                  <CountryFlag code={employee.nationality} size="xxs" /> {getCountryName(employee.nationality)}
                </span>
              ) : (
                <Dash />
              )}
            </Fact>
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <Panel bodyClassName="p-0" title="Isprave i rokovi">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4">Isprava</TableHead>
                  <TableHead>Broj</TableHead>
                  <TableHead>Vrijedi do</TableHead>
                  <TableHead className="pr-4 text-right">Stanje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groups.map((group) => (
                  <React.Fragment key={group}>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableCell className="py-1.5 pl-4 text-xs font-medium text-muted-foreground" colSpan={4}>
                        {group}
                      </TableCell>
                    </TableRow>
                    {deadlines
                      .filter((deadline) => deadline.group === group)
                      .map((deadline) => (
                        <TableRow key={deadline.key}>
                          <TableCell className="py-2.5 pl-4">
                            <span className="font-medium">{deadline.label}</span>
                            {/* Categories belong to the licence: shown on its row. */}
                            {deadline.key === 'driverLicenceExpiryDate' && licences.length > 0 && (
                              <span className="mt-1 flex">
                                <LicenceCategories licences={licences} size="sm" />
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="py-2.5 font-mono text-xs">
                            {/* Copied for border and loading paperwork (develop had it in the list). */}
                            {deadline.number && <CopyValue value={deadline.number} what="Broj" />}
                          </TableCell>
                          <TableCell className="py-2.5 tabular-nums">
                            {deadline.date ? formatDate(deadline.date) : <Dash />}
                          </TableCell>
                          <TableCell className="py-2.5 pr-4 text-right">
                            <ExpiryBadge date={deadline.date} okLabel="Valjana" />
                          </TableCell>
                        </TableRow>
                      ))}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </Panel>

          <EmployeeFiles employee={employee} />

          {driver && <DriverOrders driverId={employee.id} />}
        </div>
      </div>

      <InviteDialog
        employee={inviting}
        onOpenChange={(open) => {
          if (!open) setInviting(null);
        }}
      />
      <DeactivateDialog
        employee={deactivating}
        onOpenChange={(open) => {
          if (!open) setDeactivating(null);
        }}
      />
    </div>
  );
}

/** Web app account: „Još nije postavio lozinku.” + resend the email invite (today's resend-invite). */
function ResendInvite({ employee }: { employee: Employee }) {
  const { mutateAsync, isPending } = useResendEmployeeInvite(employee.id);

  async function handleResend() {
    try {
      await mutateAsync();
      showSuccessToast({ title: 'Pozivnica ponovno poslana', description: `Poslano na ${employee.email}.` });
    } catch {
      showErrorToast({ title: 'Slanje pozivnice nije uspjelo', description: 'Pokušaj ponovno.' });
    }
  }

  return (
    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
      <span className="text-xs text-warning">Još nije postavio lozinku.</span>
      <Button loading={isPending} size="xs" variant="ghost" onClick={() => void handleResend()}>
        <Icon data-icon="inline-start" icon="IconMailForward" size="xs" /> Ponovno pošalji pozivnicu
      </Button>
    </span>
  );
}

/** Zadnji nalozi: the driver's last 5 by loading date, newest first (today's getShipments driver filter). */
function DriverOrders({ driverId }: { driverId: string }) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useShipments({
    params: { driverId, page: 1, size: 5, sort: 'loadingReadyDate,desc' },
  });
  const { data: clients } = useClients();
  const clientName = (id?: string) => clients?.find((client) => String(client.id) === String(id))?.name;
  const orders = data?.data ?? [];

  let body: React.ReactNode;
  if (isLoading) {
    body = (
      <div className="flex flex-col gap-3 p-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton className="h-6 w-full" key={index} />
        ))}
      </div>
    );
  } else if (isError) {
    body = (
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm text-muted-foreground">
        Nalozi se nisu učitali.
        <Button size="sm" variant="outline" onClick={() => void refetch()}>
          <Icon data-icon="inline-start" icon="IconRefresh" size="s" /> Pokušaj ponovno
        </Button>
      </div>
    );
  } else if (orders.length === 0) {
    body = <p className="p-4 text-sm text-muted-foreground">Vozač još nema naloga.</p>;
  } else {
    body = (
      <Table>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              className="cursor-pointer"
              key={order.id}
              onClick={() => void router.push(`/dashboard/shipments/${order.id}`)}
            >
              <TableCell className="py-3 pl-4 font-medium tabular-nums">
                <Link
                  className="outline-none focus-visible:underline"
                  href={`/dashboard/shipments/${order.id}`}
                  onClick={(event) => event.stopPropagation()}
                >
                  {order.orderNumber}
                </Link>
              </TableCell>
              <TableCell className="py-3">{clientName(order.clientId) ?? <Dash />}</TableCell>
              <TableCell className="py-3 text-muted-foreground">{routeOf(order)}</TableCell>
              <TableCell className="py-3 pr-4 text-right text-muted-foreground tabular-nums">{dateOf(order)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <Panel
      action={
        <Button
          nativeButton={false}
          render={<Link href={`/dashboard/shipments?driverId=${encodeURIComponent(driverId)}`} />}
          size="sm"
          variant="ghost"
        >
          Svi nalozi vozača <Icon data-icon="inline-end" icon="IconExternalLink" size="s" />
        </Button>
      }
      bodyClassName="p-0"
      title="Zadnji nalozi"
    >
      {body}
    </Panel>
  );
}
