/**
 * „Vozilo / Vozač” (lab /tables assignment-cell.tsx, picked F): vehicle and driver as icon + text; a missing one is a
 * dashed red „+ Dodijeli …” button with a searchable list that assigns right in the table. Agency nalozi show the
 * contractor (💼). Vehicle = today's assign call with the old modal's default stop dates (one stop per address, its
 * earliest cargo date); driver = set on the nalog's unfinished, driverless stops on its vehicle (one `updateVehicleStop`
 * per stop, DECISIONS §6). Both then offer „Obavijesti vozača” (one notify per stop).
 */

import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { type Employee, notifyVehicleStopDriver, type Shipment, type VehicleStop } from '@/lib/api';
import { useAssignShipmentToVehicle, useUpdateVehicleStop } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { closeToast, showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { isStopCompleted } from '@/lib/utils/vehicleStops';
import { Icon, type IconType } from '@/ui';

import { getDriversNotifiedToast, getEmployeeNames, getStopDriverIds } from '../driverNotifications';
import { getLatestStop, useLookups } from '../shared/lookups';
import { MISSING_BUTTON } from '../shared/tones';
import { getAssignStopDates } from './assignStops';

interface Option {
  value: string;
  label: string;
  hint?: string;
}

function AssignButton({
  label,
  placeholder,
  heading,
  options,
  disabledReason,
  onSelect,
}: {
  label: string;
  placeholder: string;
  heading: string;
  options: Option[];
  /** Shown instead of the list when assigning here isn't possible. */
  disabledReason?: string;
  onSelect(value: string): Promise<void>;
}) {
  const [open, setOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  return (
    <Popover open={open} onOpenChange={(next) => !busy && setOpen(next)}>
      <PopoverTrigger
        render={
          <Button
            className={cn('w-fit', MISSING_BUTTON)}
            loading={busy}
            size="xs"
            variant="outline"
            // The row opens the nalog on click; this button must not.
            onClick={(event) => event.stopPropagation()}
          />
        }
      >
        <Icon data-icon="inline-start" icon="IconPlus" size="xs" /> {label}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0" onClick={(event) => event.stopPropagation()}>
        {disabledReason ? (
          <p className="p-3 text-sm text-muted-foreground">{disabledReason}</p>
        ) : (
          <Command>
            <CommandInput placeholder={placeholder} />
            <CommandList>
              <CommandEmpty>Nema rezultata.</CommandEmpty>
              <CommandGroup heading={heading}>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={`${option.label} ${option.hint ?? ''}`}
                    onSelect={() => {
                      setBusy(true);
                      setOpen(false);
                      void onSelect(option.value).finally(() => setBusy(false));
                    }}
                  >
                    <span className="truncate">{option.label}</span>
                    {option.hint && <span className="ml-auto text-xs text-muted-foreground">{option.hint}</span>}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}

function Line({ icon, text, title, muted }: { icon: IconType; text: string; title?: string; muted?: boolean }) {
  return (
    <span className={cn('flex min-w-0 items-center gap-1.5', muted && 'text-muted-foreground')} title={title}>
      <Icon className={cn(!muted && 'opacity-70')} icon={icon} size="s" />
      <span className="truncate">{text}</span>
    </span>
  );
}

/** Today's notify prompt after an assignment, as a toast action: one notify per stop that has a driver. */
function offerNotify(stops: VehicleStop[], { employees, clientName, orderNumber, onDone }: NotifyContext) {
  const withDriver = stops.filter((stop) => !!stop.driverId);
  if (!withDriver.length) return;
  const names = getEmployeeNames(getStopDriverIds(withDriver), employees);
  const toastId = showSuccessToast({
    title: names.length > 1 ? 'Obavijestiti vozače?' : 'Obavijestiti vozača?',
    description: names.length ? `${names.join(', ')}: utovari i istovari ovog naloga` : undefined,
    timeout: 10000,
    action: {
      label: 'Obavijesti',
      onClick: () => {
        closeToast(toastId);
        void (async () => {
          const results = await Promise.allSettled(withDriver.map((stop) => notifyVehicleStopDriver(stop.id)));
          const notified = results
            .filter((result): result is PromiseFulfilledResult<VehicleStop> => result.status === 'fulfilled')
            .map((result) => result.value);
          onDone();
          if (!notified.length) {
            showErrorToast({ title: 'Obavijest nije poslana. Pokušaj ponovno s naloga.' });
            return;
          }
          showSuccessToast(getDriversNotifiedToast({ notifiedStops: notified, employees, clientName, orderNumber }));
        })();
      },
    },
  });
}

interface NotifyContext {
  employees: Employee[];
  clientName?: string;
  orderNumber: string;
  onDone(): void;
}

export function AssignmentCell({ shipment }: { shipment: Shipment }) {
  const { vehiclesById, employeesById, contractorsById, clientsById, motorVehicles, drivers } = useLookups();
  const queryClient = useQueryClient();
  const { mutateAsync: assignShipment } = useAssignShipmentToVehicle();
  const { mutateAsync: updateStop } = useUpdateVehicleStop();

  const latestStop = getLatestStop(shipment);
  const vehicle = latestStop ? vehiclesById.get(latestStop.vehicleId) : undefined;
  const driver = latestStop?.driverId ? employeesById.get(latestStop.driverId) : undefined;

  if (shipment.isAgency && !vehicle && !latestStop?.driverId) {
    const contractor = shipment.transportContractorId ? contractorsById.get(shipment.transportContractorId) : undefined;
    return (
      <span title="Agencijski nalog: prijevoz obavlja kontraktor">
        <Line icon="IconBriefcase" muted text={contractor?.name ?? '—'} />
      </span>
    );
  }

  const { cargoStopDates, missingDates } = getAssignStopDates(shipment.cargo);
  const notifyContext: NotifyContext = {
    employees: [...employeesById.values()],
    clientName: shipment.clientId ? clientsById.get(shipment.clientId)?.name : undefined,
    orderNumber: shipment.orderNumber,
    onDone: () => {
      void queryClient.invalidateQueries({ queryKey: ['shipments'] });
      void queryClient.invalidateQueries({ queryKey: ['shipment', shipment.id] });
      void queryClient.invalidateQueries({ queryKey: ['vehicleStops'] });
    },
  };

  async function handleAssignVehicle(vehicleId: string) {
    const picked = vehiclesById.get(vehicleId);
    try {
      const stops = await assignShipment({ shipmentId: shipment.id, vehicleId, cargoStopDates });
      showSuccessToast({ title: picked ? `Vozilo ${picked.registration} dodijeljeno` : 'Vozilo dodijeljeno' });
      // The new stops take the vehicle's driver (if it has one): offer to notify, like today's modal.
      offerNotify(stops, notifyContext);
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Vozilo nije dodijeljeno. Pokušaj ponovno.' });
    }
  }

  // Only the nalog's unfinished stops on its current vehicle that have no driver yet; finished stops never change.
  const driverlessStops = (shipment.vehicleStops ?? []).filter(
    (stop) => !isStopCompleted(stop) && !stop.driverId && stop.vehicleId === latestStop?.vehicleId
  );

  async function handleAssignDriver(driverId: string) {
    const updated: VehicleStop[] = [];
    try {
      for (const stop of driverlessStops) updated.push(await updateStop({ id: stop.id, data: { driverId } }));
      const name = employeesById.get(driverId)?.fullName;
      showSuccessToast({ title: name ? `Vozač ${name} dodijeljen` : 'Vozač dodijeljen' });
      offerNotify(updated, notifyContext);
    } catch (error) {
      console.error(error);
      showErrorToast({
        title: updated.length ? 'Vozač je dodijeljen samo dijelu utovara i istovara.' : 'Vozač nije dodijeljen.',
        description: 'Pokušaj ponovno.',
      });
    } finally {
      void queryClient.invalidateQueries({ queryKey: ['shipments'] });
      void queryClient.invalidateQueries({ queryKey: ['shipment', shipment.id] });
    }
  }

  const hasOpenStops = driverlessStops.length > 0;

  return (
    <div className="flex min-w-0 flex-col gap-1">
      {vehicle ? (
        <Line
          icon="IconTruck"
          text={vehicle.registration}
          title={[vehicle.registration, vehicle.brand].filter(Boolean).join(' · ')}
        />
      ) : (
        <AssignButton
          disabledReason={
            missingDates
              ? 'Nekim utovarima ili istovarima nedostaje datum. Dodijeli vozilo s naloga.'
              : !shipment.cargo.length
                ? 'Nalog nema tereta.'
                : undefined
          }
          heading="Vozila"
          label="Dodijeli vozilo"
          options={motorVehicles.map((option) => ({
            value: option.id,
            label: option.registration,
            hint: option.brand,
          }))}
          placeholder="Traži registraciju…"
          onSelect={handleAssignVehicle}
        />
      )}
      {driver ? (
        <Line icon="IconUser" text={driver.fullName} title={driver.fullName} />
      ) : (
        vehicle && (
          <AssignButton
            disabledReason={hasOpenStops ? undefined : 'Nema nezavršenih utovara ni istovara bez vozača.'}
            heading="Vozači"
            label="Dodijeli vozača"
            options={drivers.map((option) => ({ value: option.id, label: option.fullName }))}
            placeholder="Traži vozača…"
            onSelect={handleAssignDriver}
          />
        )
      )}
    </div>
  );
}
