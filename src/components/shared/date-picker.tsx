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
 * view). DateRangePicker = presets on the left + two months (Analitika).
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

export function DatePicker({
  id,
  value,
  onChange,
  invalid,
  disabled,
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
          defaultMonth={value ?? undefined}
          locale={hr}
          mode="single"
          selected={value ?? undefined}
          onSelect={(date) => {
            onChange(date ?? null);
            setOpen(false);
          }}
        />
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
// Date range with presets (Analitika)
// ---------------------------------------------------------------------------------------------------------------------

export type { DateRange };

function addMonths(date: Date, months: number) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export interface DateRangePreset {
  label: string;
  /** undefined = no limit („Ukupno”). */
  range(today: Date): DateRange | undefined;
}

export const DATE_RANGE_PRESETS: DateRangePreset[] = [
  { label: 'Od početka godine', range: (today) => ({ from: new Date(today.getFullYear(), 0, 1), to: today }) },
  { label: 'Zadnja 3 mjeseca', range: (today) => ({ from: addMonths(today, -3), to: today }) },
  { label: 'Zadnjih 6 mjeseci', range: (today) => ({ from: addMonths(today, -6), to: today }) },
  { label: 'Zadnjih 12 mjeseci', range: (today) => ({ from: addMonths(today, -12), to: today }) },
  { label: 'Zadnje 2 godine', range: (today) => ({ from: addMonths(today, -24), to: today }) },
  { label: 'Zadnjih 5 godina', range: (today) => ({ from: addMonths(today, -60), to: today }) },
  { label: 'Ukupno', range: () => undefined },
];

function sameDay(a: Date | undefined, b: Date | undefined) {
  return !!a && !!b && a.toDateString() === b.toDateString();
}

export function DateRangePicker({
  value,
  onChange,
  presets = DATE_RANGE_PRESETS,
  className,
}: {
  value: DateRange | undefined;
  onChange(value: DateRange | undefined): void;
  presets?: DateRangePreset[];
  className?: string;
}) {
  const today = React.useMemo(() => new Date(), []);
  const [open, setOpen] = React.useState(false);

  const activePreset = presets.find((preset) => {
    const presetRange = preset.range(today);
    if (!presetRange || !value) return !presetRange && !value;
    return sameDay(presetRange.from, value.from) && sameDay(presetRange.to, value.to);
  });

  const label = !value?.from ? 'Ukupno' : `${formatDate(value.from)} – ${value.to ? formatDate(value.to) : '…'}`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <DateTrigger className={cn('w-auto min-w-64', className)} isEmpty={false}>
        {activePreset ? `${activePreset.label} · ${label}` : label}
      </DateTrigger>
      <PopoverContent align="start" className="w-auto p-0">
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
                  setOpen(false);
                }}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <Calendar
            defaultMonth={value?.from ? addMonths(value.to ?? value.from, -1) : undefined}
            disabled={{ after: today }}
            locale={hr}
            mode="range"
            numberOfMonths={2}
            selected={value}
            onSelect={onChange}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
