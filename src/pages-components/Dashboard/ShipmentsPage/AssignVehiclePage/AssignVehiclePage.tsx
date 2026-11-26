/**
 * Dodijeli vozilo (DECISIONS §5, lab /assign) — a page instead of today's AssignVehicleModal + SelectDriverDialog +
 * NotifyDriversDialog: /dashboard/shipments/[id]/assign, `?created=1` right after „Kreiraj nalog” (Korak 2 od 2, with
 * „Preskoči”), else from Nalog detail („Odustani”). Left: the nalog and its utovari / istovari with prefilled, editable
 * dates (one per address, the earliest of its tereta, as today). Right: the vehicle dropdown (where it will be on the
 * loading day, what it already has on these days; vehicles without conflicts first), the driver (required when the
 * vehicle has none — KAN-145 `driverId`), and the vehicle's vertical route with the new stops. Sticky bar: vehicle ·
 * driver, „Obavijesti vozača”, Preskoči / Odustani, „Dodijeli KC 123-AB”. Same calls as today: assignShipmentToVehicle,
 * then notifyShipmentDrivers when asked to. Capacity check and trailer: later.
 */

import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import * as React from 'react';

import { CRUMBS, DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { CountryFlag } from '@/components/shared/country-flag';
import { DatePicker } from '@/components/shared/date-picker';
import { ENTITY_ICON } from '@/components/shared/entity-icons';
import { EntityNotFound, isNotFoundError } from '@/components/shared/not-found';
import { Panel } from '@/components/shared/panel';
import { StopKindLabel } from '@/components/shared/stop-kind';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldError } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { track } from '@/lib/analytics';
import type { Employee, Shipment, Vehicle } from '@/lib/api';
import type { VehicleStop } from '@/lib/api/vehicleStops';
import {
  useAssignShipmentToVehicle,
  useNotifyShipmentDrivers,
  useShipment,
  useVehicleStopsByVehicle,
} from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/utils/plural';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';

import { getDriversNotifiedToast, getStopDriverIds } from '../driverNotifications';
import { type AssignStop, buildAssignStops, cargoStopDatesFor, defaultStopDates } from '../list/assignStops';
import { NalogFormHeader, NalogFormProblem } from '../NewShipmentPage/NalogFormLayout';
import { shipmentHref } from '../shared/actions';
import { formatKg, formatNumber } from '../shared/format';
import { type ShipmentLookups, useShipmentLookups } from '../shared/lookups';
import { DriverCombobox, VehicleCombobox, type VehicleRow } from './pickers';
import type { NewStop } from './route';
import { RoutePanel } from './RoutePanel';

/**
 * The backend ignores the limit (every unfinished stop + the last 5 finished ones per vehicle); 20 = the same query as
 * Prijevozi, so the two pages share one cached call.
 */
const STOPS_PER_VEHICLE = 20;

export const AssignVehiclePage = () => {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : undefined;
  const fromCreate = router.query.created === '1';
  const { data: shipment, error, isError, refetch, isFetching } = useShipment(id);
  const lookups = useShipmentLookups();
  const orderNumber = shipment?.orderNumber;

  // Decided once, from the first loaded nalog: after assigning, its refetch has vehicle stops, and the page must stay
  // on the assign content while it notifies and navigates away.
  const [status, setStatus] = React.useState<{ id: string; value: AssignStatus } | null>(null);
  if (shipment && status?.id !== shipment.id) setStatus({ id: shipment.id, value: assignStatusOf(shipment) });

  let content: React.ReactNode;
  if (shipment && status?.id === shipment.id && !lookups.isLoading) {
    if (status.value === 'agency') {
      content = (
        <NalogFormProblem
          backHref={shipmentHref(shipment.id)}
          backLabel="Natrag na nalog"
          description="Agencijski nalog vozi podvozar, vozilo mu se ne dodjeljuje."
          icon={ENTITY_ICON.agency}
          title="Agencijski nalog"
        />
      );
    } else if (status.value === 'assigned') {
      content = (
        <NalogFormProblem
          backHref={shipmentHref(shipment.id)}
          backLabel="Natrag na nalog"
          description="Utovari i istovari ovog naloga već su na ruti vozila. Promijeni ih na nalogu ili u Prijevozima."
          icon="IconTruck"
          title="Nalog je već dodijeljen vozilu"
        />
      );
    } else if (status.value === 'empty') {
      content = (
        <NalogFormProblem
          backHref={shipmentHref(shipment.id)}
          backLabel="Natrag na nalog"
          description="Dodaj teret s utovarom i istovarom, pa dodijeli vozilo."
          icon="IconPackage"
          title="Nalog nema tereta"
        />
      );
    } else {
      content = <AssignContent fromCreate={fromCreate} key={shipment.id} lookups={lookups} shipment={shipment} />;
    }
  } else if (isNotFoundError(error)) {
    content = <EntityNotFound kind="shipment" />;
  } else if (isError) {
    content = (
      <NalogFormProblem
        backHref="/dashboard/shipments"
        backLabel="Nalozi"
        danger
        description="Možda je obrisan, ili je problem kod nas. Pokušaj ponovno."
        icon="IconAlertOctagon"
        title="Nalog se nije učitao"
        onRetry={isFetching ? undefined : () => void refetch()}
      />
    );
  } else {
    content = <AssignSkeleton />;
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        CRUMBS.shipments,
        ...(shipment ? [{ label: shipment.orderNumber, href: shipmentHref(shipment.id) }] : []),
        { label: 'Dodijeli vozilo' },
      ]}
    >
      <PageTitle title={orderNumber} type="Dodijeli vozilo" />
      {content}
    </DashboardLayout>
  );
};

type AssignStatus = 'agency' | 'assigned' | 'empty' | 'ready';

function assignStatusOf(shipment: Shipment): AssignStatus {
  if (shipment.isAgency) return 'agency';
  if ((shipment.vehicleStops?.length ?? 0) > 0) return 'assigned';
  if (!shipment.cargo.length) return 'empty';
  return 'ready';
}

/** Driver of a vehicle: the driver of its latest stop (new stops inherit it, DECISIONS §6); a deleted one doesn't count. */
function vehicleDriverId(stops: VehicleStop[], employeesById: Map<string, Employee>) {
  const latest = stops[0];
  const driver = latest?.driverId ? employeesById.get(latest.driverId) : undefined;
  return driver && !driver.deleted ? driver.id : undefined;
}

function AssignContent({
  shipment,
  lookups,
  fromCreate,
}: {
  shipment: Shipment;
  lookups: ShipmentLookups;
  fromCreate: boolean;
}) {
  const router = useRouter();
  const { clientsById, employeesById, motorVehicles, drivers } = lookups;
  const { data: groups, isLoading: isGroupsLoading } = useVehicleStopsByVehicle(STOPS_PER_VEHICLE);
  const { mutateAsync: assignShipment, isPending: isAssigning } = useAssignShipmentToVehicle();
  const { mutateAsync: notifyDrivers, isPending: isNotifying } = useNotifyShipmentDrivers(shipment.id);
  const [isLeaving, setIsLeaving] = React.useState(false);
  const busy = isAssigning || isNotifying || isLeaving;

  const today = React.useMemo(() => dayjs().format('YYYY-MM-DD'), []);
  const assignStops = React.useMemo(() => buildAssignStops(shipment.cargo), [shipment.cargo]);
  const [dates, setDates] = React.useState(() => defaultStopDates(assignStops, shipment.cargo));
  const [vehicleId, setVehicleId] = React.useState<string>();
  const [driverId, setDriverId] = React.useState<string>();
  const [notify, setNotify] = React.useState(true);
  const [tried, setTried] = React.useState(false);

  const cargoIndex = React.useMemo(
    () => new Map(shipment.cargo.map((cargo, index) => [cargo.id, index + 1])),
    [shipment.cargo]
  );
  const newStops: NewStop[] = assignStops.map((stop) => ({
    key: stop.key,
    kinds: [
      ...(stop.loadingCargoIds.length ? (['loading'] as const) : []),
      ...(stop.unloadingCargoIds.length ? (['unloading'] as const) : []),
    ],
    date: dates[stop.key] ?? null,
  }));

  // Every vehicle that can drive a nalog (today's modal listed only those the stops call returned).
  const rows: VehicleRow[] = React.useMemo(() => {
    const stopsByVehicle = new Map((groups ?? []).map((group) => [group.vehicleId, group.stops]));
    return motorVehicles.map((vehicle: Vehicle) => {
      const stops = stopsByVehicle.get(vehicle.id) ?? [];
      const driverOfVehicle = vehicleDriverId(stops, employeesById);
      return {
        vehicle,
        stops,
        driverId: driverOfVehicle,
        driverName: driverOfVehicle ? employeesById.get(driverOfVehicle)?.fullName : undefined,
      };
    });
  }, [groups, motorVehicles, employeesById]);

  const row = rows.find((item) => item.vehicle.id === vehicleId);
  const driver = driverId ? employeesById.get(driverId) : undefined;
  const missingDates = assignStops.filter((stop) => !dates[stop.key]);
  const driverMissing = !!row && !row.driverId && !driverId;

  function selectVehicle(next: string | undefined) {
    setVehicleId(next);
    // The new stops take the vehicle's current driver unless changed below.
    setDriverId(rows.find((item) => item.vehicle.id === next)?.driverId);
  }

  function leave(href: string) {
    setIsLeaving(true);
    void router.push(href);
  }

  async function handleAssign() {
    if (!row || missingDates.length || driverMissing) {
      setTried(true);
      const firstId = !row
        ? 'assign-vehicle'
        : missingDates.length
          ? `assign-date-${missingDates[0].key}`
          : 'assign-driver';
      document.getElementById(firstId)?.focus();
      return;
    }

    let assigned: VehicleStop[];
    try {
      assigned = await assignShipment({
        shipmentId: shipment.id,
        vehicleId: row.vehicle.id,
        cargoStopDates: cargoStopDatesFor(shipment.cargo, dates),
        // Only when it differs from the vehicle's: otherwise the stops inherit it (KAN-145).
        driverId: driverId && driverId !== row.driverId ? driverId : undefined,
      });
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Greška pri dodjeli naloga vozilu' });
      return;
    }
    track('vehicle assigned', { entry: 'page' });
    showSuccessToast({ title: `Nalog #${shipment.orderNumber} dodijeljen vozilu ${row.vehicle.registration}` });

    if (notify && getStopDriverIds(assigned).length > 0) {
      try {
        const notified = await notifyDrivers();
        if (notified.length === 0) {
          showErrorToast({
            title: 'Obavijest nije poslana',
            description: 'Vozaču nije dostavljen nijedan utovar ni istovar.',
          });
        } else {
          track('drivers notified', { entry: 'assign', again: false });
          showSuccessToast(
            getDriversNotifiedToast({
              notifiedStops: notified,
              employees: [...employeesById.values()],
              clientName: shipment.clientId ? clientsById.get(shipment.clientId)?.name : undefined,
              orderNumber: shipment.orderNumber,
            })
          );
        }
      } catch (error) {
        console.error(error);
        showErrorToast({ title: 'Greška prilikom slanja obavijesti', description: 'Pokušaj ponovno s naloga.' });
      }
    }
    // Moves on either way: the nalog is assigned, the driver can still be notified from it (today).
    leave(`/dashboard/vehicle-stops/${row.vehicle.id}`);
  }

  const client = shipment.clientId ? clientsById.get(shipment.clientId) : undefined;

  return (
    <div className="flex flex-col gap-5">
      <NalogFormHeader
        backHref={shipmentHref(shipment.id)}
        backLabel={`Nalog #${shipment.orderNumber}`}
        title="Dodijeli vozilo"
      />
      {fromCreate && (
        <Alert size="sm" variant="success">
          <AlertTitle>Nalog #{shipment.orderNumber} dodan</AlertTitle>
          <AlertDescription>
            Korak 2 od 2: odaberi vozilo, ili preskoči i dodijeli ga kasnije s naloga.
          </AlertDescription>
        </Alert>
      )}
      <div className="grid items-start gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="flex flex-col gap-4 xl:sticky xl:top-[calc(var(--app-header-height,0px)+1rem)]">
          <Panel title={`Nalog #${shipment.orderNumber}`}>
            <div className="flex flex-col gap-0.5 text-sm">
              <span className="font-medium">{client?.name ?? '—'}</span>
              <span className="text-muted-foreground tabular-nums">{cargoSummary(shipment)}</span>
            </div>
          </Panel>
          <Panel bodyClassName="p-0" title="Utovari i istovari">
            <ol className="divide-y">
              {assignStops.map((stop) => (
                <StopRow
                  cargoLabel={cargoLabel(stop, cargoIndex)}
                  date={dates[stop.key] ?? null}
                  invalid={tried && !dates[stop.key]}
                  key={stop.key}
                  stop={stop}
                  onDate={(date) => setDates((current) => ({ ...current, [stop.key]: date }))}
                />
              ))}
            </ol>
          </Panel>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <Field data-invalid={tried && !row ? true : undefined}>
            <VehicleCombobox
              id="assign-vehicle"
              invalid={tried && !row}
              loading={isGroupsLoading}
              newStops={newStops}
              rows={rows}
              today={today}
              value={vehicleId}
              onChange={selectVehicle}
            />
            {tried && !row && <FieldError>Odaberi vozilo.</FieldError>}
          </Field>
          {row && (
            <DriverField
              driverId={driverId}
              drivers={drivers}
              row={row}
              rows={rows}
              showError={tried}
              onChange={setDriverId}
            />
          )}
          <RoutePanel
            driverId={driverId}
            driverName={driver?.fullName}
            loading={isGroupsLoading}
            newStops={newStops}
            orderNumber={shipment.orderNumber}
            row={row}
            stopLabel={(key) => {
              const stop = assignStops.find((item) => item.key === key);
              return stop ? { address: stop.address, companyName: stop.companyName } : undefined;
            }}
            today={today}
          />
        </div>
      </div>

      {/* The action, last in reading order and always in reach (lab ActionBar). */}
      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-xl border bg-popover px-4 py-3 shadow-lg">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span className="text-sm">
            {row ? (
              <>
                <span className="font-mono font-medium">{row.vehicle.registration}</span>
                <span className="text-muted-foreground"> · {driver?.fullName ?? 'bez vozača'}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Vozilo nije odabrano</span>
            )}
          </span>
          <label className={cn('flex items-center gap-2 text-sm', !driver && 'text-muted-foreground')}>
            <Checkbox
              checked={!!driver && notify}
              disabled={!driver || busy}
              onCheckedChange={(on) => setNotify(!!on)}
            />
            Obavijesti vozača{driver ? ` (${driver.fullName})` : ''}
          </label>
        </div>
        <div className="flex gap-2">
          <Button
            disabled={busy}
            variant="ghost"
            onClick={() => leave(fromCreate ? '/dashboard/shipments' : shipmentHref(shipment.id))}
          >
            {fromCreate ? 'Preskoči' : 'Odustani'}
          </Button>
          <Button disabled={isLeaving} loading={isAssigning || isNotifying} onClick={() => void handleAssign()}>
            {row ? (
              <>
                Dodijeli <span className="font-mono">{row.vehicle.registration}</span>
              </>
            ) : (
              'Dodijeli vozilo'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function cargoSummary(shipment: Shipment) {
  const count = shipment.cargo.length;
  const ldm = shipment.cargo.reduce((sum, cargo) => sum + (cargo.ldm ?? 0), 0);
  const weight = shipment.cargo.reduce((sum, cargo) => sum + (cargo.weight ?? 0), 0);
  return `${count} ${plural(count, ['teret', 'tereta', 'tereta'])} · ${formatNumber(ldm, 2)} LDM · ${formatKg(weight)}`;
}

/** „Teret 1, Teret 2” (only with more than one teret). */
function cargoLabel(stop: AssignStop, cargoIndex: Map<string, number>) {
  if (cargoIndex.size < 2) return undefined;
  const ids = [...new Set([...stop.loadingCargoIds, ...stop.unloadingCargoIds])];
  return ids.map((id) => `Teret ${cargoIndex.get(id)}`).join(', ');
}

function StopRow({
  stop,
  date,
  cargoLabel: label,
  invalid,
  onDate,
}: {
  stop: AssignStop;
  date: string | null;
  cargoLabel?: string;
  invalid: boolean;
  onDate(date: string | null): void;
}) {
  return (
    <li className="flex flex-col gap-2 px-4 py-3">
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {stop.loadingCargoIds.length > 0 && <StopKindLabel kind="loading" />}
        {stop.unloadingCargoIds.length > 0 && <StopKindLabel kind="unloading" />}
        {label && <span className="text-muted-foreground">· {label}</span>}
      </span>
      <span className="flex min-w-0 flex-col text-sm">
        <span className="truncate font-medium">{stop.companyName || stop.address.streetName}</span>
        <span className="flex items-center gap-1.5 text-muted-foreground">
          {stop.address.countryCode && <CountryFlag code={stop.address.countryCode} size="xxs" />}
          <span className="truncate">
            {[stop.address.postalCode, stop.address.placeName].filter(Boolean).join(' ')}
            {stop.companyName && stop.address.streetName ? ` · ${stop.address.streetName}` : ''}
          </span>
        </span>
      </span>
      {/* Prefilled from the tereta (earliest date at this address), as today; change it here if needed. */}
      <DatePicker
        id={`assign-date-${stop.key}`}
        invalid={invalid}
        value={date ? dayjs(date).toDate() : null}
        onChange={(next) => onDate(next ? dayjs(next).format('YYYY-MM-DD') : null)}
      />
      {invalid && <FieldError>Odaberi datum.</FieldError>}
    </li>
  );
}

/**
 * The driver for these stops (lab `DriverField`): prefilled with the vehicle's driver; a vehicle without one asks here
 * (required, red *) instead of today's separate „Odaberi vozača” dialog.
 */
function DriverField({
  row,
  rows,
  drivers,
  driverId,
  onChange,
  showError,
}: {
  row: VehicleRow;
  rows: VehicleRow[];
  drivers: Employee[];
  driverId?: string;
  onChange(driverId: string | undefined): void;
  showError: boolean;
}) {
  const required = !row.driverId;
  const missing = required && !driverId;
  return (
    <Field data-invalid={showError && missing ? true : undefined}>
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-sm font-medium" htmlFor="assign-driver">
          {row.driverId ? 'Promijeni vozača' : 'Dodijeli vozača'}
          {required && (
            <span aria-hidden className="text-destructive">
              {' '}
              *
            </span>
          )}
        </label>
        {row.driverId && driverId !== row.driverId && (
          <button
            className="text-xs text-muted-foreground hover:text-foreground"
            type="button"
            onClick={() => onChange(row.driverId)}
          >
            Vrati {row.driverName}
          </button>
        )}
      </div>
      <DriverCombobox
        drivers={drivers}
        id="assign-driver"
        invalid={showError && missing}
        required={required}
        rows={rows}
        value={driverId}
        onChange={onChange}
      />
      {missing ? (
        <span className={cn('text-xs', showError ? 'text-destructive' : 'text-muted-foreground')}>
          {showError ? 'Odaberi vozača.' : `${row.vehicle.registration} nema vozača.`}
        </span>
      ) : row.driverId && driverId && driverId !== row.driverId ? (
        <span className="text-xs text-muted-foreground">
          Samo za utovare i istovare ovog naloga; {row.driverName} ostaje na ostalima.
        </span>
      ) : null}
    </Field>
  );
}

function AssignSkeleton() {
  return (
    <div aria-busy className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-56" />
      </div>
      <div className="grid items-start gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
