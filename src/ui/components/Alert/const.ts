import type { TextVariant } from '@/ui/theme/fontSizes';

import type { IconSize } from '../Icon/const';

export const variantsMap = {
  default: 'bg-dark-75 dark:bg-light-850 text-dark-700 dark:text-light-100',
  danger: 'bg-legacy-red-100 dark:bg-legacy-red-700/40 text-legacy-red-800 dark:text-legacy-red-100',
  warning: 'bg-orange-100 dark:bg-orange-700/60 text-orange-800 dark:text-orange-100',
  info: 'bg-legacy-blue-100 dark:bg-legacy-blue-900/40 text-legacy-blue-800 dark:text-legacy-blue-100',
  success: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-100',
};

export type AlertVariant = keyof typeof variantsMap;

// `m` matches the original (pre-size) styling, so it stays the default.
// `iconOffset` centers the icon on the first text line: (line height - icon size) / 2.
export const sizesMap: Record<
  's' | 'm' | 'l',
  { container: string; text: TextVariant; title: TextVariant; icon: IconSize; iconOffset: string }
> = {
  s: {
    container: 'gap-2 rounded-legacy-m px-3 py-2',
    text: 'text-xs',
    title: 'text-xs-medium',
    icon: 'm',
    iconOffset: 'mt-[2px]',
  },
  m: {
    container: 'gap-2 rounded-legacy-m px-4 py-3',
    text: 'text-s',
    title: 'text-s-medium',
    icon: 'l',
    iconOffset: '',
  },
  l: {
    container: 'gap-3 rounded-legacy-l px-6 py-4',
    text: 'text-m',
    title: 'text-m-medium',
    icon: 'xl',
    iconOffset: 'mt-[2px]',
  },
};

export type AlertSize = keyof typeof sizesMap;
