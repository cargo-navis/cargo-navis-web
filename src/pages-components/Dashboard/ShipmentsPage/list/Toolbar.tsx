/**
 * Nalozi toolbar (lab /tables): Status utovara (swapped with Status fakture 2026-11-23, which moved into „Više
 * filtera”), Vozač, date range (Spremno za utovar) and „Više filtera” (the rest of
 * today's 11 filter fields); on the right the server-side sort (same as the column headers) and the column picker.
 * Under it the always-present chip row (B) with the result count on the right, so adding a filter never moves the
 * table. Filters apply at once and are remembered (localStorage, as today).
 */

import dayjs from 'dayjs';
import * as React from 'react';

import {
  DatePicker,
  type DateRange,
  DateRangePicker,
  UPCOMING_DATE_RANGE_PRESETS,
} from '@/components/shared/date-picker';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Client } from '@/lib/api';
import { LoadStatus } from '@/lib/api/shipments';
import { useDispatchers } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils/date';
import { Icon } from '@/ui';

import { SortFieldEnum, useShipmentsSortLocalStorage } from '../hooks';
import { type ShipmentFilters, useShipmentsFiltersContext } from '../providers/ShipmentsFiltersProvider';
import { CARGO_STATUS_LABEL } from '../shared/cargo';
import { INVOICE_STATUS_LABEL, INVOICE_STATUSES } from '../shared/invoice';
import { useLookups } from '../shared/lookups';

interface Option {
  value: string;
  label: string;
}

const LOAD_STATUSES: Option[] = [LoadStatus.NotYetLoaded, LoadStatus.Loaded, LoadStatus.Unloaded].map((status) => ({
  value: status,
  label: CARGO_STATUS_LABEL[status],
}));
const OVERDUE_OPTIONS: Option[] = [
  { value: 'true', label: 'Da' },
  { value: 'false', label: 'Ne' },
];
const TYPE_OPTIONS: Option[] = [
  { value: 'false', label: 'Vlastiti' },
  { value: 'true', label: 'Agencijski' },
];

const labelOf = (options: Option[], value: string | undefined) =>
  options.find((option) => option.value === value)?.label;

// Stored as YYYY-MM-DD (today's format), shown as „7.11.2026.”.
const toDate = (value: string | undefined) => (value ? dayjs(value).toDate() : null);
const toStored = (date: Date | null | undefined) => (date ? dayjs(date).format('YYYY-MM-DD') : undefined);

/** Active-filter look for toolbar triggers: dashed when empty, solid with a petrol tint when set. */
const filterTriggerClass = (isActive: boolean) =>
  cn(
    'max-w-64 justify-start',
    isActive ? 'border-primary/40 bg-primary/5 text-foreground hover:bg-primary/10' : 'border-dashed'
  );

export interface ActiveFilter {
  key: string;
  label: string;
  onRemove(): void;
}

/** Every active filter as a chip label („Vozač: Ivan Horvat”), with how to remove it. */
export function useActiveFilters(): ActiveFilter[] {
  const { filters, setFilters } = useShipmentsFiltersContext();
  const { clientsById, employeesById } = useLookups();
  const clear = (patch: Partial<ShipmentFilters>) => () => setFilters(patch);
  const range = (from?: string, to?: string) => `${from ? formatDate(from) : '…'} – ${to ? formatDate(to) : '…'}`;

  return [
    filters.invoiceStatus && {
      key: 'invoiceStatus',
      label: `Status fakture: ${INVOICE_STATUS_LABEL[filters.invoiceStatus as keyof typeof INVOICE_STATUS_LABEL] ?? filters.invoiceStatus}`,
      onRemove: clear({ invoiceStatus: undefined }),
    },
    filters.driverId && {
      key: 'driver',
      label: `Vozač: ${employeesById.get(filters.driverId)?.fullName ?? '—'}`,
      onRemove: clear({ driverId: undefined }),
    },
    filters.clientId && {
      key: 'client',
      label: `Klijent: ${clientsById.get(filters.clientId)?.name ?? '—'}`,
      onRemove: clear({ clientId: undefined }),
    },
    filters.dispatcherId && {
      key: 'dispatcher',
      label: `Disponent: ${employeesById.get(filters.dispatcherId)?.fullName ?? '—'}`,
      onRemove: clear({ dispatcherId: undefined }),
    },
    filters.loadStatus && {
      key: 'loadStatus',
      label: `Status utovara: ${labelOf(LOAD_STATUSES, filters.loadStatus)}`,
      onRemove: clear({ loadStatus: undefined }),
    },
    filters.isInvoiceOverdue && {
      key: 'overdue',
      label: `Valuta istekla: ${labelOf(OVERDUE_OPTIONS, filters.isInvoiceOverdue)}`,
      onRemove: clear({ isInvoiceOverdue: undefined }),
    },
    filters.isAgency && {
      key: 'type',
      label: `Tip: ${labelOf(TYPE_OPTIONS, filters.isAgency)}`,
      onRemove: clear({ isAgency: undefined }),
    },
    (filters.loadingReadyDateFrom || filters.loadingReadyDateTo) && {
      key: 'ready',
      label: `Spremno: ${range(filters.loadingReadyDateFrom, filters.loadingReadyDateTo)}`,
      onRemove: clear({ loadingReadyDateFrom: undefined, loadingReadyDateTo: undefined }),
    },
    (filters.unloadingDueDateFrom || filters.unloadingDueDateTo) && {
      key: 'due',
      label: `Rok istovara: ${range(filters.unloadingDueDateFrom, filters.unloadingDueDateTo)}`,
      onRemove: clear({ unloadingDueDateFrom: undefined, unloadingDueDateTo: undefined }),
    },
  ].filter((chip): chip is ActiveFilter => !!chip);
}

const MORE_FILTER_KEYS = [
  'clientId',
  'dispatcherId',
  'invoiceStatus',
  'isInvoiceOverdue',
  'isAgency',
  'unloadingDueDateFrom',
  'unloadingDueDateTo',
] as const;

function FilterSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option[];
  value: string | undefined;
  onChange(value: string | undefined): void;
}) {
  const items = [{ value: null, label: 'Svi' }, ...options];
  return (
    <Field>
      <FieldLabel>{label}</FieldLabel>
      <Select
        items={items}
        value={value ?? null}
        onValueChange={(next) => onChange((next as string | null) ?? undefined)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Svi" />
        </SelectTrigger>
        <SelectContent>
          {items.map((option) => (
            <SelectItem key={option.value ?? 'all'} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

function ClientFilter({ value, onChange }: { value: string | undefined; onChange(value: string | undefined): void }) {
  const { clientsById } = useLookups();
  const clients = React.useMemo(
    () => [...clientsById.values()].sort((a, b) => a.name.localeCompare(b.name)),
    [clientsById]
  );
  const selected = value ? (clientsById.get(value) ?? null) : null;
  return (
    <Combobox
      autoHighlight
      isItemEqualToValue={(a: Client, b: Client) => a.id === b.id}
      itemToStringLabel={(client: Client) => client.name}
      items={clients}
      value={selected}
      onValueChange={(client: Client | null) => onChange(client?.id)}
    >
      <ComboboxInput className="w-full" placeholder="Svi klijenti" showClear={!!selected} />
      <ComboboxContent>
        <ComboboxEmpty>Nema tog klijenta.</ComboboxEmpty>
        <ComboboxList>
          {(client: Client) => (
            <ComboboxItem key={client.id} value={client}>
              <span className="truncate">{client.name}</span>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

/** „Više filtera”: the rest of today's filter fields, in a popover; they apply at once. */
function MoreFiltersPopover() {
  const { filters, setFilters } = useShipmentsFiltersContext();
  const { data: dispatchers = [] } = useDispatchers();
  const activeCount = new Set(
    MORE_FILTER_KEYS.filter((key) => !!filters[key]).map((key) => (key.startsWith('unloading') ? 'due' : key))
  ).size;

  return (
    <Popover>
      <PopoverTrigger render={<Button className={filterTriggerClass(activeCount > 0)} variant="outline" />}>
        <Icon data-icon="inline-start" icon="IconAdjustmentsHorizontal" size="s" /> Više filtera
        {activeCount > 0 && (
          <Badge className="ml-1 tabular-nums" size="sm">
            {activeCount}
          </Badge>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[min(36rem,calc(100vw-2rem))] gap-4 p-4">
        <PopoverHeader>
          <PopoverTitle>Više filtera</PopoverTitle>
          <PopoverDescription>Primjenjuju se odmah.</PopoverDescription>
        </PopoverHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field className="sm:col-span-2">
            <FieldLabel>Klijent</FieldLabel>
            <ClientFilter value={filters.clientId} onChange={(clientId) => setFilters({ clientId })} />
          </Field>
          <FilterSelect
            label="Disponent"
            options={dispatchers.map((employee) => ({ value: employee.id, label: employee.fullName }))}
            value={filters.dispatcherId}
            onChange={(dispatcherId) => setFilters({ dispatcherId })}
          />
          <FilterSelect
            label="Status fakture"
            options={INVOICE_STATUSES.map((status) => ({ value: status, label: INVOICE_STATUS_LABEL[status] }))}
            value={filters.invoiceStatus}
            onChange={(invoiceStatus) => setFilters({ invoiceStatus })}
          />
          <FilterSelect
            label="Valuta istekla"
            options={OVERDUE_OPTIONS}
            value={filters.isInvoiceOverdue}
            onChange={(isInvoiceOverdue) => setFilters({ isInvoiceOverdue })}
          />
          <FilterSelect
            label="Tip naloga"
            options={TYPE_OPTIONS}
            value={filters.isAgency}
            onChange={(isAgency) => setFilters({ isAgency })}
          />
          <Field>
            <FieldLabel>Spremno za utovar · od</FieldLabel>
            <DatePicker
              value={toDate(filters.loadingReadyDateFrom)}
              onChange={(date) => setFilters({ loadingReadyDateFrom: toStored(date) })}
            />
          </Field>
          <Field>
            <FieldLabel>Spremno za utovar · do</FieldLabel>
            <DatePicker
              value={toDate(filters.loadingReadyDateTo)}
              onChange={(date) => setFilters({ loadingReadyDateTo: toStored(date) })}
            />
          </Field>
          <Field>
            <FieldLabel>Rok istovara · od</FieldLabel>
            <DatePicker
              value={toDate(filters.unloadingDueDateFrom)}
              onChange={(date) => setFilters({ unloadingDueDateFrom: toStored(date) })}
            />
          </Field>
          <Field>
            <FieldLabel>Rok istovara · do</FieldLabel>
            <DatePicker
              value={toDate(filters.unloadingDueDateTo)}
              onChange={(date) => setFilters({ unloadingDueDateTo: toStored(date) })}
            />
          </Field>
        </div>
        <div className="flex justify-end border-t pt-3">
          <Button
            disabled={activeCount === 0}
            variant="ghost"
            onClick={() => setFilters(Object.fromEntries(MORE_FILTER_KEYS.map((key) => [key, undefined])))}
          >
            Očisti ove filtere
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Same server-side sort as the Utovar / Istovar / Cijena column headers; „Najnovije” = today's default. */
const SORT_OPTIONS = [
  { value: 'default', label: 'Najnovije' },
  { value: `${SortFieldEnum.LoadingReadyDate}-desc`, label: 'Spremno za utovar ↓' },
  { value: `${SortFieldEnum.LoadingReadyDate}-asc`, label: 'Spremno za utovar ↑' },
  { value: `${SortFieldEnum.UnloadingDueDate}-desc`, label: 'Rok istovara ↓' },
  { value: `${SortFieldEnum.UnloadingDueDate}-asc`, label: 'Rok istovara ↑' },
  { value: `${SortFieldEnum.Price}-desc`, label: 'Cijena ↓' },
  { value: `${SortFieldEnum.Price}-asc`, label: 'Cijena ↑' },
];

function SortSelect() {
  const { getSortField, getSortDirection, setSort, clearSort } = useShipmentsSortLocalStorage();
  const field = getSortField();
  const direction = field ? getSortDirection(field) : null;
  const value = field && direction ? `${field}-${direction}` : 'default';
  return (
    <Select
      items={SORT_OPTIONS}
      value={SORT_OPTIONS.some((option) => option.value === value) ? value : 'default'}
      onValueChange={(next) => {
        if (!next || next === 'default') return clearSort();
        const [sortField, dir] = (next as string).split('-') as [SortFieldEnum, 'asc' | 'desc'];
        setSort(sortField, dir);
      }}
    >
      <SelectTrigger aria-label="Poredaj" className="w-52">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export interface ColumnToggle {
  id: string;
  label: string;
  visible: boolean;
  onToggle(visible: boolean): void;
}

export function ShipmentsToolbar({ columns }: { columns: ColumnToggle[] }) {
  const { filters, setFilters } = useShipmentsFiltersContext();
  const { drivers, employeesById } = useLookups();

  const range: DateRange | undefined =
    filters.loadingReadyDateFrom || filters.loadingReadyDateTo
      ? {
          from: toDate(filters.loadingReadyDateFrom) ?? undefined,
          to: toDate(filters.loadingReadyDateTo) ?? undefined,
        }
      : undefined;

  const driverItems = [
    { value: null, label: 'Svi vozači' },
    ...drivers.map((driver) => ({ value: driver.id, label: driver.fullName })),
  ];
  // A remembered driver who is no longer active still shows by name.
  if (filters.driverId && !drivers.some((driver) => driver.id === filters.driverId)) {
    driverItems.push({ value: filters.driverId, label: employeesById.get(filters.driverId)?.fullName ?? '—' });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button className={filterTriggerClass(!!filters.loadStatus)} variant="outline" />}>
          <Icon data-icon="inline-start" icon="IconFilter" size="s" /> Status utovara
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuRadioGroup
            value={filters.loadStatus ?? 'all'}
            onValueChange={(value: string) => setFilters({ loadStatus: value === 'all' ? undefined : value })}
          >
            <DropdownMenuRadioItem value="all">Svi</DropdownMenuRadioItem>
            {LOAD_STATUSES.map((status) => (
              <DropdownMenuRadioItem key={status.value} value={status.value}>
                {status.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Select
        items={driverItems}
        value={filters.driverId ?? null}
        onValueChange={(value) => setFilters({ driverId: (value as string | null) ?? undefined })}
      >
        <SelectTrigger className={cn('w-auto min-w-36', filterTriggerClass(!!filters.driverId))}>
          <Icon className="text-muted-foreground" icon="IconUser" size="s" />
          <SelectValue placeholder="Vozač">{() => 'Vozač'}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {driverItems.map((item) => (
            <SelectItem key={item.value ?? 'all'} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <DateRangePicker
        className={cn(range && 'border-primary/40 bg-primary/5')}
        future
        presets={UPCOMING_DATE_RANGE_PRESETS}
        value={range}
        onChange={(next) =>
          setFilters({ loadingReadyDateFrom: toStored(next?.from), loadingReadyDateTo: toStored(next?.to) })
        }
      />

      <MoreFiltersPopover />

      <div className="ml-auto flex items-center gap-2">
        <SortSelect />
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button aria-label="Stupci" size="icon" variant="outline" />}>
            <Icon icon="IconColumns3" size="s" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Prikaži stupce</DropdownMenuLabel>
              {columns.map((column) => (
                <DropdownMenuCheckboxItem
                  checked={column.visible}
                  key={column.id}
                  onCheckedChange={(checked) => column.onToggle(!!checked)}
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove(): void }) {
  return (
    <Badge className="h-7 gap-1 pr-1 pl-2.5 text-xs" variant="secondary">
      {label}
      <button
        aria-label="Ukloni filter"
        className="rounded-full p-0.5 hover:bg-foreground/10"
        type="button"
        onClick={onRemove}
      >
        <Icon className="size-3.5! [&_svg]:size-full!" icon="IconX" size="xs" />
      </button>
    </Badge>
  );
}

/** The always-present chip row; its right end carries the result count. */
export function FilterChipRow({ filters, resultsLabel }: { filters: ActiveFilter[]; resultsLabel?: string }) {
  const { clearAll } = useShipmentsFiltersContext();
  return (
    <div className="flex min-h-8 flex-wrap items-center gap-2">
      {filters.length > 0 ? (
        <>
          {filters.map((filter) => (
            <FilterChip key={filter.key} label={filter.label} onRemove={filter.onRemove} />
          ))}
          <Button size="sm" variant="ghost" onClick={clearAll}>
            Očisti filtere
          </Button>
        </>
      ) : (
        <span className="text-sm text-muted-foreground">Nema aktivnih filtera.</span>
      )}
      {resultsLabel && <span className="ml-auto text-sm text-muted-foreground tabular-nums">{resultsLabel}</span>}
    </div>
  );
}
