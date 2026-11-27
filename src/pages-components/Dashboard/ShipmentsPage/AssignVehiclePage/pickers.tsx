import * as React from 'react';

import { CountryFlag } from '@/components/shared/country-flag';
import { DriverAvatar } from '@/components/shared/driver-avatar';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import type { Employee, Vehicle } from '@/lib/api';
import type { VehicleStop } from '@/lib/api/vehicleStops';
import { cn } from '@/lib/utils';
import { formatDateShort } from '@/lib/utils/date';
import { Icon } from '@/ui';

import { normalizeSearch } from '../../Partners/partners';
import { STATUS_TEXT } from '../shared/tones';
import { dayOf, fitOf, type NewStop, stopKinds } from './route';

export interface VehicleRow {
  vehicle: Vehicle;
  /** Newest first (API order). */
  stops: VehicleStop[];
  /** The vehicle's driver (driver of its latest stop). */
  driverId?: string;
  driverName?: string;
}

const KIND_WORD = { loading: 'utovar', unloading: 'istovar' } as const;

/** „Ljubljana” (the place of a stop). */
const placeOf = (stop: VehicleStop) => stop.address?.placeName || stop.address?.postalCode || '—';

/** Where it will be on the loading day, and what it already has on the new stops' days (lab `FitLine`). */
function FitLine({ row, newStops, today }: { row: VehicleRow; newStops: NewStop[]; today: string }) {
  const { loadDay, where, conflicts } = fitOf(row.stops, newStops, today);
  return (
    <span className="flex min-w-0 flex-col gap-0.5 text-xs">
      <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
        {where ? (
          <>
            {formatDateShort(loadDay)} u:{' '}
            {where.address?.countryCode && <CountryFlag code={where.address.countryCode} size="xxs" />}
            <span className="truncate text-foreground">{placeOf(where)}</span>
            {dayOf(where.date) !== loadDay && <span className="shrink-0">(od {formatDateShort(where.date!)})</span>}
          </>
        ) : (
          'Nema nedavnih utovara ni istovara'
        )}
      </span>
      {conflicts.length > 0 && (
        <span className={cn('flex items-start gap-1', STATUS_TEXT.warning, 'font-normal')}>
          <Icon className="mt-px size-3.5! shrink-0 [&_svg]:size-full!" icon="IconAlertTriangle" size="xs" />
          <span>
            Već ima{' '}
            {conflicts
              .map(
                (stop) =>
                  `${stopKinds(stop)
                    .map((kind) => KIND_WORD[kind])
                    .join(' i ')} ${formatDateShort(stop.date!)} · ${placeOf(stop)}`
              )
              .join(', ')}
          </span>
        </span>
      )}
    </span>
  );
}

/**
 * Vozilo (lab `VehicleDropdown`): searchable by registration, brand, driver and place (today's modal search); each
 * option says where the vehicle will be on the loading day and warns about stops on the same days. Vehicles with
 * nothing on these days first.
 */
export function VehicleCombobox({
  id,
  rows,
  newStops,
  today,
  value,
  onChange,
  invalid,
  loading,
}: {
  id: string;
  rows: VehicleRow[];
  newStops: NewStop[];
  today: string;
  value?: string;
  onChange(vehicleId: string | undefined): void;
  invalid?: boolean;
  loading?: boolean;
}) {
  const items = React.useMemo(
    () =>
      rows
        .map((row) => ({ row, conflicts: fitOf(row.stops, newStops, today).conflicts.length }))
        .sort((a, b) => a.conflicts - b.conflicts)
        .map(({ row }) => row),
    [rows, newStops, today]
  );
  const selected = rows.find((row) => row.vehicle.id === value) ?? null;
  const searchText = (row: VehicleRow) =>
    normalizeSearch(
      [row.vehicle.registration, row.vehicle.brand, row.driverName, ...row.stops.map((stop) => stop.address?.placeName)]
        .filter(Boolean)
        .join(' ')
    );

  return (
    <Combobox
      autoHighlight
      filter={(row: VehicleRow, query: string) => searchText(row).includes(normalizeSearch(query))}
      isItemEqualToValue={(a: VehicleRow, b: VehicleRow) => a.vehicle.id === b.vehicle.id}
      itemToStringLabel={(row: VehicleRow) => `${row.vehicle.registration} · ${row.driverName ?? 'bez vozača'}`}
      items={items}
      value={selected}
      onValueChange={(next) => onChange((next as VehicleRow | null)?.vehicle.id)}
    >
      <ComboboxInput
        aria-invalid={invalid || undefined}
        className="w-full"
        id={id}
        placeholder="Odaberi vozilo: registracija, vozač…"
      />
      <ComboboxContent className="w-(--anchor-width)">
        <ComboboxEmpty>{loading ? 'Učitavam vozila…' : 'Nema vozila.'}</ComboboxEmpty>
        <ComboboxList>
          {(row: VehicleRow) => (
            <ComboboxItem className="items-start" key={row.vehicle.id} value={row}>
              <span className="flex w-32 shrink-0 flex-col">
                <span className="font-mono font-medium">{row.vehicle.registration}</span>
                <span className="flex min-w-0 items-center gap-1.5 text-xs">
                  <DriverAvatar driverId={row.driverId} name={row.driverName} size="sm" />
                  <span className={row.driverId ? 'truncate text-muted-foreground' : 'truncate text-destructive'}>
                    {row.driverName ?? 'Bez vozača'}
                  </span>
                </span>
              </span>
              <FitLine newStops={newStops} row={row} today={today} />
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

/** Vozač: the same searchable select; each option says what the driver drove lately („KC 123-AB · zadnje 6.11.”). */
export function DriverCombobox({
  id,
  drivers,
  rows,
  value,
  onChange,
  invalid,
  required,
}: {
  id: string;
  drivers: Employee[];
  rows: VehicleRow[];
  value?: string;
  onChange(driverId: string | undefined): void;
  invalid?: boolean;
  required?: boolean;
}) {
  const recent = React.useMemo(() => {
    const byDriver = new Map<string, string>();
    for (const row of rows) {
      if (!row.driverId || byDriver.has(row.driverId)) continue;
      const latest = row.stops[0];
      byDriver.set(
        row.driverId,
        `${row.vehicle.registration}${latest?.date ? ` · zadnje ${formatDateShort(latest.date)}` : ''}`
      );
    }
    return byDriver;
  }, [rows]);
  const selected = drivers.find((driver) => driver.id === value) ?? null;

  return (
    <Combobox
      autoHighlight
      filter={(driver: Employee, query: string) => normalizeSearch(driver.fullName).includes(normalizeSearch(query))}
      isItemEqualToValue={(a: Employee, b: Employee) => a.id === b.id}
      itemToStringLabel={(driver: Employee) => driver.fullName}
      items={drivers}
      value={selected}
      onValueChange={(next) => onChange((next as Employee | null)?.id)}
    >
      <ComboboxInput
        aria-invalid={invalid || undefined}
        className="w-full"
        id={id}
        placeholder="Odaberi vozača: ime…"
        required={required}
      />
      <ComboboxContent className="w-(--anchor-width)">
        <ComboboxEmpty>Nema vozača.</ComboboxEmpty>
        <ComboboxList>
          {(driver: Employee) => (
            <ComboboxItem key={driver.id} value={driver}>
              <DriverAvatar driverId={driver.id} name={driver.fullName} size="sm" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate">{driver.fullName}</span>
                <span className="text-xs text-muted-foreground">{recent.get(driver.id) ?? 'Nema nedavnih vožnji'}</span>
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
