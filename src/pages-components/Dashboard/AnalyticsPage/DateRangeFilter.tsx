import * as Popover from '@radix-ui/react-popover';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { useState } from 'react';

import { Box, Button, Datepicker, FlexLayout, Icon, Text } from '@/ui';
import { withFieldLabels } from '@/ui/hocs/form';

type DateRangePreset =
  | 'last-3-months'
  | 'last-6-months'
  | 'last-12-months'
  | 'year-to-date'
  | 'last-2-years'
  | 'last-5-years'
  | 'total';

interface PresetOption {
  value: DateRangePreset;
  label: string;
}

const PRESET_OPTIONS: PresetOption[] = [
  { value: 'year-to-date', label: 'Od početka godine' },
  { value: 'last-3-months', label: 'Zadnja 3 mjeseca' },
  { value: 'last-6-months', label: 'Zadnjih 6 mjeseci' },
  { value: 'last-12-months', label: 'Zadnjih 12 mjeseci' },
  { value: 'last-2-years', label: 'Zadnje 2 godine' },
  { value: 'last-5-years', label: 'Zadnjih 5 godina' },
  { value: 'total', label: 'Ukupno' },
];

export interface DateRange {
  from: string | undefined;
  to: string | undefined;
}

const computePresetRange = (preset: DateRangePreset): DateRange => {
  if (preset === 'total') {
    return { from: undefined, to: undefined };
  }

  const now = dayjs();
  const to = now.format('YYYY-MM-DD');

  let from: string;
  switch (preset) {
    case 'last-3-months':
      from = now.subtract(3, 'month').format('YYYY-MM-DD');
      break;
    case 'last-6-months':
      from = now.subtract(6, 'month').format('YYYY-MM-DD');
      break;
    case 'last-12-months':
      from = now.subtract(12, 'month').format('YYYY-MM-DD');
      break;
    case 'year-to-date':
      from = now.startOf('year').format('YYYY-MM-DD');
      break;
    case 'last-2-years':
      from = now.subtract(2, 'year').format('YYYY-MM-DD');
      break;
    case 'last-5-years':
      from = now.subtract(5, 'year').format('YYYY-MM-DD');
      break;
  }
  return { from, to };
};

/** Format YYYY-MM-DD to DD.MM.YYYY for display */
const formatDisplayDate = (date: string): string => {
  return dayjs(date).format('DD.MM.YYYY');
};

const getPresetSubtitle = (preset: DateRangePreset): string => {
  const { from, to } = computePresetRange(preset);
  if (!from && !to) return '';
  if (from && to) return `${formatDisplayDate(from)} - ${formatDisplayDate(to)}`;
  return '';
};

export const getInitialDateRange = (preset: DateRangePreset): DateRange => computePresetRange(preset);

interface DateRangeFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export const DateRangeFilter = ({ value, onChange }: DateRangeFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<DateRangePreset | 'custom'>('last-6-months');
  const [draftFrom, setDraftFrom] = useState<string | null>(value.from ?? null);
  const [draftTo, setDraftTo] = useState<string | null>(value.to ?? null);

  const handlePresetClick = (preset: DateRangePreset) => {
    const range = computePresetRange(preset);
    setActivePreset(preset);
    setDraftFrom(range.from ?? null);
    setDraftTo(range.to ?? null);
    onChange(range);
    setIsOpen(false);
  };

  const handleApplyCustom = () => {
    setActivePreset('custom');
    onChange({ from: draftFrom ?? undefined, to: draftTo ?? undefined });
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setDraftFrom(null);
      setDraftTo(null);
    }
    setIsOpen(open);
  };

  const triggerLabel = (() => {
    if (activePreset === 'custom') {
      const parts: string[] = [];
      if (value.from) parts.push(formatDisplayDate(value.from));
      if (value.to) parts.push(formatDisplayDate(value.to));
      return parts.length > 0 ? parts.join(' - ') : 'Razdoblje';
    }
    const option = PRESET_OPTIONS.find((o) => o.value === activePreset);
    return option?.label ?? 'Razdoblje';
  })();

  return (
    <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <Box
          as="button"
          className={clsx(
            'inline-flex items-center gap-2 px-3 py-2 h-[44px] w-[260px] rounded-s cursor-pointer',
            'border-[2px] border-dark-300 dark:border-light-800',
            'hover:border-dark-500 hover:dark:border-light-700',
            'focus:!border-teal-600 dark:focus:!border-teal-800',
            'bg-transparent transition-all duration-100 outline-none'
          )}
        >
          <Text className="flex-1 whitespace-nowrap text-left truncate" color="text-color-1" variant="text-xs-medium">
            {triggerLabel}
          </Text>
          <Icon
            className="text-dark-500 dark:text-light-100"
            icon={isOpen ? 'IconChevronUp' : 'IconChevronDown'}
            size="m"
            type="outline"
          />
        </Box>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          className={clsx(
            'z-[50] w-[300px] rounded-xl p-4',
            'bg-white dark:bg-light-850',
            'border border-dark-100 dark:border-light-800',
            'shadow-dark-3',
            'animate-in fade-in-0 zoom-in-95'
          )}
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* Custom date pickers */}
          <FlexLayout className="flex-col gap-3">
            <FlexLayout className="flex-col gap-1">
              <Text color="text-color-3" variant="text-xxs-medium">
                OD
              </Text>
              <Datepicker
                isClearable={false}
                maxDate={draftTo ?? undefined}
                placeholder="Unesi datum"
                value={draftFrom}
                onChange={setDraftFrom}
              />
            </FlexLayout>

            <FlexLayout className="flex-col gap-1">
              <Text color="text-color-3" variant="text-xxs-medium">
                DO
              </Text>
              <Datepicker
                isClearable={false}
                minDate={draftFrom ?? undefined}
                placeholder="Unesi datum"
                value={draftTo}
                onChange={setDraftTo}
              />
            </FlexLayout>

            <Button isFullWidth text="Primijeni" variant="primary" onClick={handleApplyCustom} />
          </FlexLayout>

          {/* Divider + Quick search */}
          <Box className="mt-4 pt-3 border-t border-dark-100 dark:border-light-800">
            <Text className="mb-2 uppercase" color="text-color-4" variant="text-xxxs-medium">
              Brzi odabir
            </Text>

            <FlexLayout className="flex-col">
              {PRESET_OPTIONS.map((option) => (
                <FlexLayout
                  as="button"
                  className={clsx(
                    'flex-col py-2 px-4 -mx-4 items-start cursor-pointer transition-colors duration-100 appearance-none border-none',
                    'hover:bg-dark-200 hover:dark:bg-white-alpha-10',
                    activePreset === option.value ? 'bg-dark-100 dark:bg-white-alpha-05' : 'bg-transparent'
                  )}
                  key={option.value}
                  onClick={() => handlePresetClick(option.value)}
                >
                  <Text color="text-color-1" variant="text-xs-medium">
                    {option.label}
                  </Text>
                  {option.value !== 'total' && (
                    <Text color="text-color-3" variant="text-xxxs">
                      {getPresetSubtitle(option.value)}
                    </Text>
                  )}
                </FlexLayout>
              ))}
            </FlexLayout>
          </Box>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export const DateRangeFilterWithLabels = withFieldLabels(DateRangeFilter);
