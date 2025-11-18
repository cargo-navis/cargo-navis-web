import { PopoverProps } from '@mantine/core';
import { DatePickerInputStylesNames } from '@mantine/dates';
import clsx from 'clsx';

import { variantMap } from '@/ui/theme/fontSizes';

export const classnames: Partial<Record<DatePickerInputStylesNames, string>> = {
  wrapper: clsx(
    // 'h-[44px]',
    'isolate',
    'text-dark-600 dark:text-light-300',
    'border-[2px] rounded-s !border-dark-300 dark:!border-light-800',
    'hover:!border-dark-500 hover:dark:!border-light-700',
    'focus-within:!border-teal-600 dark:focus-within:!border-teal-800'
  ),
  input: clsx(
    'py-3 h-full',
    'bg-transparent',
    'text-dark-800 dark:text-light-50 border-none font-display',
    'leading-[24px]',
    variantMap['text-s']
  ),
  section: 'data-[position=left]:z-[-1]',
  day: clsx(
    'rounded-m h-[30px] w-[30px]',
    '!text-dark-600 dark:!text-light-200',
    'text-center hover:!bg-dark-50 hover:dark:!bg-light-600 data-[outside]:!text-dark-400 data-[outside]:dark:!text-light-400 font-display',
    'data-[selected]:!text-white data-[selected]:dark:!text-light-100',
    'data-[today]:border-teal-500 data-[today]:dark:border-teal-600',
    'data-[weekend]:!text-red-500 data-[weekend]:dark:!text-red-400',
    'disabled:!text-dark-200 disabled:dark:!text-light-700',
    'focus-visible:outline-none',
    'data-[selected]:bg-teal-500 data-[selected]:dark:bg-teal-600 hover:data-[selected]:bg-teal-500 hover:data-[selected]:dark:bg-teal-500 active:bg-teal-500 active:dark:bg-teal-500'
  ),
  weekday: clsx('font-display text-dark-600 dark:text-teal-200', variantMap['text-xxs-medium']),
  calendarHeaderLevel: clsx(
    'flex grow items-center justify-center text-center px-3 rounded-xs text-inherit font-display hover:!bg-dark-50 hover:dark:!bg-light-600',
    'focus-visible:outline-none',
    variantMap['text-xs-medium']
  ),
  calendarHeaderControl: clsx(
    'flex justify-center items-center w-[32px] h-[32px] text-center rounded-s hover:!bg-dark-50 hover:dark:!bg-light-600',
    '!text-center text-dark-500 dark:text-light-400 hover:!text-dark-800 hover:dark:!text-light-50',
    'focus-visible:outline-none',
    'disabled:invisible'
  ),
  monthsListControl: clsx(
    '!text-dark-600 dark:!text-light-200',
    'h-[32px] grow text-center rounded-s hover:!bg-dark-50 hover:dark:!bg-light-600',
    variantMap['text-xs'],
    'focus-visible:outline-none',
    'disabled:text-dark-200 disabled:dark:!text-light-700 disabled:cursor-not-allowed',
    'data-[selected]:text-white',
    'data-[selected]:bg-teal-500 data-[selected]:dark:bg-teal-600',
    'data-[selected]:hover:bg-teal-500 data-[selected]:hover:dark:bg-teal-500'
  ),
  yearsListControl: clsx(
    '!text-dark-600 dark:!text-light-200',
    'h-[32px] grow text-center rounded-s hover:!bg-dark-50 hover:dark:!bg-light-600',
    variantMap['text-xs'],
    'focus-visible:outline-none',
    'disabled:text-dark-200 disabled:dark:!text-light-700 disabled:cursor-not-allowed',
    'data-[selected]:text-white data-[selected]:bg-teal-500 data-[selected]:dark:bg-teal-600 data-[selected]:hover:!bg-teal-500 data-[selected]:hover:dark:!bg-teal-500'
  ),
};

export const popoverProps: PopoverProps = {
  classNames: {
    dropdown: clsx(
      'text-dark-800 dark:text-dark-50',
      'bg-white dark:bg-light-850',
      'border border-dark-100 dark:border-light-800 shadow-dark-3 rounded-xl !p-3'
    ),
  },
  withinPortal: false,
};
