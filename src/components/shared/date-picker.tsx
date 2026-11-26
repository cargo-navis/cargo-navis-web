import * as React from 'react';
import type { DateRange } from 'react-day-picker';
import { hr } from 'react-day-picker/locale';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils/date';
import { Icon } from '@/ui';

/**
 * Date fields (lab /forms date-fields.tsx): a trigger styled like an input (40px outline button, calendar icon),
 * Croatian calendar in a popover, „7.11.2026.” format, × to clear. YearPicker = 12-year grid (Calendar has no year
 * view). DateRangePicker = presets on the left + two months (Analitika, Nalozi).
 */

/** Trigger styled like an input (outline button), so it lines up with the other fields. */
function DateTrigger({
  invalid,
  children,
  isEmpty,
  className,
  ...props
}: React.ComponentProps<typeof Button> & {
  invalid?: boolean;
  isEmpty: boolean;
}) {
  return (
    <PopoverTrigger
      render={
        <Button
          aria-invalid={invalid || undefined}
          className={cn(
            'h-10 w-full justify-start border-input px-2.5 font-normal',
            isEmpty && 'text-muted-foreground',
            className
          )}
          data-slot="date-trigger"
          variant="outline"
          {...props}
        />
      }
    >
      <Icon className="text-muted-foreground" data-icon="inline-start" icon="IconCalendar" size="s" />
      <span className="truncate">{children}</span>
    </PopoverTrigger>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Single date
// ---------------------------------------------------------------------------------------------------------------------

/** Expiry dates (contracts, documents, vehicle checks): the year dropdown starts six years back. */
export function expiryStartMonth() {
  return new Date(new Date().getFullYear() - 6, 0);
}

export function DatePicker({
  id,
  value,
  onChange,
  invalid,
  disabled,
  startMonth,
  marked,
  placeholder = 'Odaberi datum',
  ref,
  onBlur,
}: {
  id?: string;
  value: Date | null;
  onChange(value: Date | null): void;
  invalid?: boolean;
  disabled?: boolean;
  placeholder?: string;
  /** First month in the year dropdown (default 100 years back). */
  startMonth?: Date;
  /** A related date shown as a coloured dot in the calendar, with a one-line legend under it („● Utovar 23.11.2026.”). */
  marked?: { date: Date; label: string; dotClassName: string };
  ref?: React.Ref<HTMLButtonElement>;
  onBlur?(): void;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative w-full">
        <DateTrigger disabled={disabled} id={id} invalid={invalid} isEmpty={!value} ref={ref} onBlur={onBlur}>
          {value ? formatDate(value) : placeholder}
        </DateTrigger>
        {value && !disabled && (
          <Button
            aria-label="Obriši datum"
            className="absolute top-1/2 right-1.5 -translate-y-1/2"
            size="icon-xs"
            variant="ghost"
            onClick={() => onChange(null)}
          >
            <Icon icon="IconX" size="xs" />
          </Button>
        )}
      </div>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          captionLayout="dropdown"
          defaultMonth={value ?? marked?.date}
          locale={hr}
          marked={marked}
          mode="single"
          selected={value ?? undefined}
          startMonth={startMonth}
          onSelect={(date) => {
            // Clicking the selected day again deselects it in the calendar: keep the value (× clears).
            if (date) onChange(date);
            setOpen(false);
          }}
        />
        {marked && (
          <p className="flex items-center gap-1.5 border-t px-3 py-2 text-xs text-muted-foreground">
            <span aria-hidden="true" className={cn('size-1.5 shrink-0 rounded-full', marked.dotClassName)} />
            {marked.label} {formatDate(marked.date)}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Year: Calendar has no year view, so a 12-year grid
// ---------------------------------------------------------------------------------------------------------------------

export function YearPicker({
  id,
  value,
  onChange,
  invalid,
  disabled,
  placeholder = 'Odaberi godinu',
}: {
  id?: string;
  value: number | null;
  onChange(value: number | null): void;
  invalid?: boolean;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [pageStart, setPageStart] = React.useState(() => Math.floor((value ?? new Date().getFullYear()) / 12) * 12);
  const currentYear = new Date().getFullYear();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <DateTrigger disabled={disabled} id={id} invalid={invalid} isEmpty={!value}>
        {value ?? placeholder}
      </DateTrigger>
      <PopoverContent align="start" className="w-72">
        <div className="flex items-center justify-between">
          <Button
            aria-label="Prethodne godine"
            size="icon-sm"
            variant="ghost"
            onClick={() => setPageStart((year) => year - 12)}
          >
            <Icon icon="IconChevronLeft" size="s" />
          </Button>
          <span className="text-sm font-medium tabular-nums">
            {pageStart} – {pageStart + 11}
          </span>
          <Button
            aria-label="Sljedeće godine"
            size="icon-sm"
            variant="ghost"
            onClick={() => setPageStart((year) => year + 12)}
          >
            <Icon icon="IconChevronRight" size="s" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {Array.from({ length: 12 }, (_, index) => pageStart + index).map((year) => (
            <Button
              className={cn('tabular-nums', year === currentYear && year !== value && 'text-primary')}
              disabled={year > currentYear}
              key={year}
              size="default"
              variant={year === value ? 'default' : 'ghost'}
              onClick={() => {
                onChange(year);
                setOpen(false);
              }}
            >
              {year}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ---------------------------------------------------------------------------------------------------------------------
// Date range with presets (Analitika; Nalozi date filter with `future` and the type in `header`)
// ---------------------------------------------------------------------------------------------------------------------

export type { DateRange };

function addMonths(date: Date, months: number) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Monday of the week (Croatian weeks start on Monday). */
function startOfWeek(date: Date) {
  return addDays(date, -((date.getDay() + 6) % 7));
}

/** The preset (and trigger text) for no date limit, on every page. */
export const ALL_DATES_LABEL = 'Svi datumi';

export interface DateRangePreset {
  label: string;
  /** undefined = no limit (ALL_DATES_LABEL). */
  range(today: Date): DateRange | undefined;
}

/** Looking back (Analitika). */
export const DATE_RANGE_PRESETS: DateRangePreset[] = [
  { label: 'Od početka godine', range: (today) => ({ from: new Date(today.getFullYear(), 0, 1), to: today }) },
  { label: 'Zadnja 3 mjeseca', range: (today) => ({ from: addMonths(today, -3), to: today }) },
  { label: 'Zadnjih 6 mjeseci', range: (today) => ({ from: addMonths(today, -6), to: today }) },
  { label: 'Zadnjih 12 mjeseci', range: (today) => ({ from: addMonths(today, -12), to: today }) },
  { label: 'Zadnje 2 godine', range: (today) => ({ from: addMonths(today, -24), to: today }) },
  { label: 'Zadnjih 5 godina', range: (today) => ({ from: addMonths(today, -60), to: today }) },
  { label: ALL_DATES_LABEL, range: () => undefined },
];

/** Around today, mostly ahead (Nalozi: loading dates are planned days). */
export const UPCOMING_DATE_RANGE_PRESETS: DateRangePreset[] = [
  { label: 'Danas', range: (today) => ({ from: today, to: today }) },
  { label: 'Sutra', range: (today) => ({ from: addDays(today, 1), to: addDays(today, 1) }) },
  { label: 'Ovaj tjedan', range: (today) => ({ from: startOfWeek(today), to: addDays(startOfWeek(today), 6) }) },
  {
    label: 'Sljedeći tjedan',
    range: (today) => ({ from: addDays(startOfWeek(today), 7), to: addDays(startOfWeek(today), 13) }),
  },
  { label: 'Zadnjih 7 dana', range: (today) => ({ from: addDays(today, -6), to: today }) },
  { label: 'Zadnjih 30 dana', range: (today) => ({ from: addDays(today, -29), to: today }) },
  { label: ALL_DATES_LABEL, range: () => undefined },
];

function sameDay(a: Date | undefined, b: Date | undefined) {
  return !!a && !!b && a.toDateString() === b.toDateString();
}

/**
 * Presets on the left, two months on the right. A range is picked with two clicks (start, end; the same day twice =
 * that day) and only then reported, so the page doesn't refetch on the first click; closing after one click keeps the
 * previous range. `future` allows days after today (Nalozi), otherwise they're disabled (Analitika). `header` sits
 * above both (Nalozi: the date type), `labelPrefix` goes before the trigger text while a range is set.
 */
export function DateRangePicker({
  value,
  onChange,
  presets = DATE_RANGE_PRESETS,
  future = false,
  header,
  labelPrefix,
  onOpenChange,
  className,
}: {
  value: DateRange | undefined;
  onChange(value: DateRange | undefined): void;
  presets?: DateRangePreset[];
  future?: boolean;
  header?: React.ReactNode;
  labelPrefix?: string;
  onOpenChange?(open: boolean): void;
  className?: string;
}) {
  const today = React.useMemo(() => new Date(), []);
  const [open, setOpen] = React.useState(false);
  // The start day while the end is being picked; null = not picking.
  const [start, setStart] = React.useState<Date | null>(null);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) setStart(null);
    onOpenChange?.(next);
  }

  function handleDayClick(day: Date) {
    if (!start) {
      setStart(day);
      return;
    }
    onChange(day < start ? { from: day, to: start } : { from: start, to: day });
    handleOpenChange(false);
  }

  const activePreset = presets.find((preset) => {
    const presetRange = preset.range(today);
    if (!presetRange || !value) return !presetRange && !value;
    return sameDay(presetRange.from, value.from) && sameDay(presetRange.to, value.to);
  });

  // One day (Danas, Sutra, the same day clicked twice) = that date once; no range = just „Svi datumi”, no preset prefix.
  const dates = !value?.from
    ? undefined
    : sameDay(value.from, value.to)
      ? formatDate(value.from)
      : `${formatDate(value.from)} – ${value.to ? formatDate(value.to) : '…'}`;
  const label = !dates
    ? ALL_DATES_LABEL
    : `${labelPrefix ?? ''}${activePreset ? `${activePreset.label} · ${dates}` : dates}`;
  const anchor = value?.from ? (future ? value.from : addMonths(value.to ?? value.from, -1)) : undefined;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <DateTrigger className={cn('w-auto min-w-64', className)} isEmpty={false}>
        {label}
      </DateTrigger>
      <PopoverContent align="start" className="w-auto gap-0 p-0">
        {header && <div className="border-b p-3">{header}</div>}
        <div className="flex flex-col sm:flex-row">
          {/* 40px rows (like fields and buttons) so the list roughly spans the calendar's height. */}
          <div className="flex flex-col gap-1 border-b p-3 sm:min-w-48 sm:border-r sm:border-b-0">
            {presets.map((preset) => (
              <Button
                className="justify-start px-3"
                key={preset.label}
                variant={preset === activePreset ? 'secondary' : 'ghost'}
                onClick={() => {
                  onChange(preset.range(today));
                  handleOpenChange(false);
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <Calendar
            defaultMonth={anchor}
            disabled={future ? undefined : { after: today }}
            locale={hr}
            mode="range"
            numberOfMonths={2}
            selected={start ? { from: start, to: undefined } : value}
            onSelect={(_range, day) => handleDayClick(day)}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
