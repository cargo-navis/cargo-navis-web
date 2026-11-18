import { useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { DriverAvatar } from '@/components/shared/driver-avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Field, FieldLabel } from '@/components/ui/field';
import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Spinner } from '@/components/ui/spinner';
import { toast } from '@/components/ui/toast';
import type { Employee } from '@/lib/api/employees.d';
import { notifyVehicleStopDriver, updateVehicleStop, type VehicleStop } from '@/lib/api/vehicleStops';
import { useDrivers, useIsMobile } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { formatDateShort } from '@/lib/utils/date';
import { plural, pluralCount } from '@/lib/utils/plural';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';

import { StopKinds } from '../StopLine';
import { isDone, kindWord, placeOnly, toUpdatePayload } from '../stops';

/**
 * Promijeni vozača (DECISIONS §5, lab /transports `DriverChangeForm`): new driver, which utovari / istovari (scope radio
 * with counts), a preview of exactly the affected ones, ☑ Obavijesti novog vozača. Finished stops never change, nor
 * ones the new driver already drives. One `updateVehicleStop` per stop (+ notify per stop) until there's a bulk
 * endpoint (DECISIONS §6), a few at a time.
 */

export interface DriverScope {
  key: string;
  label: string;
  /** Unfinished utovari / istovari this option would change. */
  stops: VehicleStop[];
}

const AT_ONCE = 3;
const STOPS_FORMS = ['utovaru / istovaru', 'utovara / istovara', 'utovara / istovara'] as const;

/** Runs `task` over `items`, at most `limit` at a time; returns which items failed. */
async function runLimited<T>(items: T[], limit: number, task: (item: T) => Promise<unknown>) {
  const failed: T[] = [];
  for (let i = 0; i < items.length; i += limit) {
    const batch = items.slice(i, i + limit);
    const results = await Promise.allSettled(batch.map(task));
    results.forEach((result, index) => result.status === 'rejected' && failed.push(batch[index]));
  }
  return failed;
}

/** The stops a new driver would actually change: unfinished and not already theirs. */
export function affectedStops(stops: VehicleStop[], driverId?: string | null) {
  return stops.filter((stop) => !isDone(stop) && (!driverId || stop.driverId !== driverId));
}

export function useChangeDriver() {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = React.useState(false);

  const refresh = React.useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['vehicleStops'], refetchType: 'all' });
    void queryClient.invalidateQueries({ queryKey: ['shipment'] });
    void queryClient.invalidateQueries({ queryKey: ['shipments'], refetchType: 'all' });
  }, [queryClient]);

  /** Notifies the driver on each stop; failures get one toast with „Pokušaj ponovno” (the cards also offer it). */
  const notifyStops = React.useCallback(
    async (stops: VehicleStop[], driver: Employee) => {
      const failed = await runLimited(stops, AT_ONCE, (stop) => notifyVehicleStopDriver(stop.id));
      refresh();
      if (failed.length > 0) {
        toast.add({
          type: 'error',
          title: `Obavijest nije poslana na ${failed.length} ${plural(failed.length, STOPS_FORMS)}`,
          description: `${driver.fullName} je vozač, ali nije obaviješten. Obavijestite ga ponovno.`,
          actionProps: { children: 'Pokušaj ponovno', onClick: () => void notifyStops(failed, driver) },
        });
      } else if (stops.length > 0) {
        showSuccessToast({ title: `${driver.fullName} je obaviješten` });
      }
      return failed;
    },
    [refresh]
  );

  /** Returns true when every driver change went through (notification failures are reported separately). */
  async function changeDriver(stops: VehicleStop[], driver: Employee, notify: boolean) {
    const touched = affectedStops(stops, driver.id);
    if (touched.length === 0) return true;
    setIsPending(true);
    const updateFailed = await runLimited(touched, AT_ONCE, (stop) =>
      updateVehicleStop(stop.id, toUpdatePayload(stop, { driverId: driver.id }))
    );
    const changed = touched.filter((stop) => !updateFailed.includes(stop));
    const notifyFailed =
      notify && changed.length > 0
        ? await runLimited(changed, AT_ONCE, (stop) => notifyVehicleStopDriver(stop.id))
        : [];
    setIsPending(false);
    refresh();

    if (changed.length > 0) {
      showSuccessToast({
        title: `Vozač ${driver.fullName} na ${changed.length} ${plural(changed.length, STOPS_FORMS)}`,
        description: !notify
          ? `${driver.fullName} još nije obaviješten.`
          : notifyFailed.length === 0
            ? `${driver.fullName} je obaviješten.`
            : undefined,
      });
    }
    if (notifyFailed.length > 0) {
      toast.add({
        type: 'error',
        title: `Obavijest nije poslana na ${notifyFailed.length} ${plural(notifyFailed.length, STOPS_FORMS)}`,
        description: `Vozač je promijenjen, ali ${driver.fullName} nije obaviješten.`,
        actionProps: { children: 'Pokušaj ponovno', onClick: () => void notifyStops(notifyFailed, driver) },
      });
    }
    if (updateFailed.length > 0) {
      showErrorToast({
        title: `Nije promijenjeno na ${updateFailed.length} ${plural(updateFailed.length, STOPS_FORMS)}`,
        description: 'Pokušajte ponovno.',
      });
    }
    return updateFailed.length === 0;
  }

  return { changeDriver, isPending };
}

export function DriverChangeForm({
  currentDriverId,
  scopes,
  driverName,
  loadingRoute = false,
  onDone,
  onCancel,
}: {
  currentDriverId: string | null;
  scopes: DriverScope[];
  driverName(id: string | null): string | undefined;
  /** Still loading the older part of the route: counts aren't final yet. */
  loadingRoute?: boolean;
  onDone(): void;
  onCancel(): void;
}) {
  const { data: drivers = [] } = useDrivers();
  const { changeDriver, isPending } = useChangeDriver();
  const [next, setNext] = React.useState<Employee | null>(null);
  const [scopeKey, setScopeKey] = React.useState(() => (scopes.find((s) => s.stops.length > 0) ?? scopes[0]).key);
  const [notify, setNotify] = React.useState(true);
  const chosen = scopes.find((scope) => scope.key === scopeKey) ?? scopes[0];
  const affected = (scope: DriverScope) => affectedStops(scope.stops, next?.id);
  const chosenStops = affected(chosen);
  const others = drivers.filter((driver) => driver.id !== currentDriverId);
  const id = React.useId();

  async function apply() {
    if (!next) return;
    const ok = await changeDriver(chosenStops, next, notify);
    if (ok) onDone();
  }

  return (
    <div className="flex flex-col gap-4">
      <Field>
        <FieldLabel htmlFor={`${id}-driver`}>Novi vozač</FieldLabel>
        <Combobox
          autoHighlight
          isItemEqualToValue={(a: Employee, b: Employee) => a.id === b.id}
          itemToStringLabel={(driver: Employee) => driver.fullName}
          items={others}
          value={next}
          onValueChange={(value) => setNext(value as Employee | null)}
        >
          <ComboboxInput className="w-full" id={`${id}-driver`} placeholder="Odaberi vozača…" />
          <ComboboxContent>
            <ComboboxEmpty>Nema vozača.</ComboboxEmpty>
            <ComboboxList>
              {(driver: Employee) => (
                <ComboboxItem key={driver.id} value={driver}>
                  <DriverAvatar driverId={driver.id} name={driver.fullName} size="sm" />
                  {driver.fullName}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Field>
      {scopes.length > 1 ? (
        <Field>
          <FieldLabel>Za koje utovare / istovare</FieldLabel>
          <RadioGroup className="gap-2" value={scopeKey} onValueChange={(value) => setScopeKey(value as string)}>
            {scopes.map((scope) => {
              const count = affected(scope).length;
              return (
                <label
                  className={cn('flex items-center gap-2 text-sm', count === 0 && 'text-muted-foreground')}
                  key={scope.key}
                >
                  <RadioGroupItem disabled={count === 0} value={scope.key} /> {scope.label} ({count})
                </label>
              );
            })}
          </RadioGroup>
          <span className="text-xs text-muted-foreground">
            Nezavršeni = bez oznake „Završeno”. Završeni ostaju kod vozača koji ih je odvezao.
          </span>
        </Field>
      ) : (
        <span className="text-sm text-muted-foreground">
          {pluralCount(chosenStops.length, [
            'nezavršen utovar / istovar',
            'nezavršena utovara / istovara',
            'nezavršenih utovara / istovara',
          ])}
          .
        </span>
      )}
      {loadingRoute && (
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <Spinner className="size-3.5" /> Učitavam ostatak rute…
        </span>
      )}
      {chosenStops.length > 0 && (
        <ul className="flex max-h-40 flex-col gap-1 overflow-y-auto rounded-lg border bg-muted/30 p-2 text-xs">
          {chosenStops.map((stop) => (
            <li className="flex items-center gap-2" key={stop.id}>
              <StopKinds className="w-14 shrink-0 text-xs" stop={stop} />
              <span className="min-w-0 flex-1 truncate">{placeOnly(stop)}</span>
              <span className={cn('tabular-nums', stop.date ? 'text-muted-foreground' : 'text-destructive')}>
                {stop.date ? formatDateShort(stop.date) : 'bez datuma'}
              </span>
              <DriverAvatar
                className="size-5 text-[0.5625rem]"
                driverId={stop.driverId}
                name={driverName(stop.driverId)}
                size="sm"
              />
            </li>
          ))}
        </ul>
      )}
      <label className="flex items-center gap-2 text-sm">
        <Checkbox checked={notify} onCheckedChange={(on) => setNotify(!!on)} /> Obavijesti novog vozača
      </label>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>
          Odustani
        </Button>
        <Button
          disabled={!next || chosenStops.length === 0 || loadingRoute}
          loading={isPending}
          onClick={() => void apply()}
        >
          Promijeni
        </Button>
      </div>
    </div>
  );
}

/** The run header's „Promijeni” / „Dodijeli vozača”: a popover (a drawer on phones). */
export function DriverChangePopover({
  driverId,
  scopes,
  driverName,
  loadingRoute,
  onOpen,
}: {
  driverId: string | null;
  scopes: DriverScope[];
  driverName(id: string | null): string | undefined;
  loadingRoute?: boolean;
  /** Called on open, e.g. to load the rest of the route so „Svi nezavršeni” is complete. */
  onOpen?(): void;
}) {
  const [open, setOpenState] = React.useState(false);
  const setOpen = (next: boolean) => {
    setOpenState(next);
    if (next) onOpen?.();
  };
  const isMobile = useIsMobile();
  const title = driverId ? 'Promijeni vozača' : 'Dodijeli vozača';
  const trigger = (
    <Button className="text-muted-foreground" size="xs" variant="ghost" onClick={() => isMobile && setOpen(true)}>
      {driverId ? 'Promijeni' : 'Dodijeli vozača'}
    </Button>
  );
  const form = (
    <DriverChangeForm
      currentDriverId={driverId}
      driverName={driverName}
      loadingRoute={loadingRoute}
      scopes={scopes}
      onCancel={() => setOpen(false)}
      onDone={() => setOpen(false)}
    />
  );

  if (isMobile) {
    return (
      <>
        {trigger}
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{title}</DrawerTitle>
            </DrawerHeader>
            <div className="overflow-y-auto p-4">{open && form}</div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={trigger} />
      <PopoverContent align="start" className="w-80">
        <PopoverHeader>
          <PopoverTitle>{title}</PopoverTitle>
        </PopoverHeader>
        {open && form}
      </PopoverContent>
    </Popover>
  );
}

/** ⋯ „Promijeni vozača od ovdje”: this stop and every later unfinished one. `stops` = newest first. */
export function DriverHandoverDialog({
  from,
  stops,
  driverName,
  onClose,
}: {
  from: VehicleStop | null;
  stops: VehicleStop[];
  driverName(id: string | null): string | undefined;
  onClose(): void;
}) {
  const index = from ? stops.findIndex((stop) => stop.id === from.id) : -1;
  const affected = index >= 0 ? stops.slice(0, index + 1).filter((stop) => !isDone(stop)) : [];
  return (
    <Dialog open={!!from} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Promijeni vozača od ovdje</DialogTitle>
          <DialogDescription>
            {from &&
              `Od ${kindWord(from, 'genitive')} ${placeOnly(from)}${from.date ? ` (${formatDateShort(from.date)})` : ''} do kraja rute. Ranije ostaju kod sadašnjeg vozača.`}
          </DialogDescription>
        </DialogHeader>
        {from && (
          <DriverChangeForm
            currentDriverId={from.driverId}
            driverName={driverName}
            scopes={[{ key: 'from', label: 'Od ovog do kraja rute', stops: affected }]}
            onCancel={onClose}
            onDone={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
