import { DateRangePicker } from '@/components/shared/date-picker';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { useClients, useDrivers, useVehicles } from '@/lib/hooks/api';

import { dateRangeToSelection, type Filters, GRANULARITY, PRESETS, selectionToDateRange, type View } from './filters';

/** One row above everything it scopes, period first (lab /analytics). */
export function FilterRow({
  view,
  filters,
  today,
  onChange,
}: {
  view: View;
  filters: Filters;
  today: Date;
  onChange(patch: Partial<Filters>): void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <DateRangePicker
        presets={PRESETS}
        value={selectionToDateRange(filters.selection, today)}
        onChange={(range) => onChange({ selection: dateRangeToSelection(range, today) })}
      />
      <ButtonGroup>
        {GRANULARITY.map((option) => (
          <Button
            aria-pressed={filters.granularity === option.key}
            key={option.key}
            variant={filters.granularity === option.key ? 'secondary' : 'outline'}
            onClick={() => onChange({ granularity: option.key })}
          >
            {option.label}
          </Button>
        ))}
      </ButtonGroup>
      {view === 'overview' && <ClientSelect value={filters.client} onChange={(client) => onChange({ client })} />}
      {view === 'regular' && (
        // As today: one or the other (a driver changes trucks).
        <>
          <DriverSelect value={filters.driver} onChange={(driver) => onChange({ driver, vehicle: undefined })} />
          <VehicleSelect value={filters.vehicle} onChange={(vehicle) => onChange({ vehicle, driver: undefined })} />
        </>
      )}
    </div>
  );
}

interface SelectProps {
  value: string | undefined;
  onChange(value: string | undefined): void;
}

function ClientSelect({ value, onChange }: SelectProps) {
  const { data: clients = [] } = useClients();
  return (
    <NativeSelect
      aria-label="Klijent"
      className="w-60"
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value || undefined)}
    >
      <NativeSelectOption value="">Svi klijenti</NativeSelectOption>
      {clients.map((client) => (
        <NativeSelectOption key={client.id} value={client.id}>
          {client.name}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );
}

function DriverSelect({ value, onChange }: SelectProps) {
  const { data: drivers = [] } = useDrivers();
  return (
    <NativeSelect
      aria-label="Vozač"
      className="w-48"
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value || undefined)}
    >
      <NativeSelectOption value="">Svi vozači</NativeSelectOption>
      {drivers.map((driver) => (
        <NativeSelectOption key={driver.id} value={driver.id}>
          {driver.fullName}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );
}

function VehicleSelect({ value, onChange }: SelectProps) {
  const { data: vehicles = [] } = useVehicles();
  return (
    <NativeSelect
      aria-label="Vozilo"
      className="w-48"
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value || undefined)}
    >
      <NativeSelectOption value="">Sva vozila</NativeSelectOption>
      {vehicles.map((vehicle) => (
        <NativeSelectOption key={vehicle.id} value={vehicle.id}>
          {vehicle.registration}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );
}
