import type { TextVariant } from '@/ui/theme/fontSizes';

import type { IconSize } from '../Icon/const';

export const variantsMap = {
  default: 'bg-dark-50 dark:bg-light-800 border-light-200/80 dark:border-dark-50/50 text-dark-800 dark:text-light-100',
  success:
    'bg-green-100 dark:bg-green-900 border-green-500/20 dark:border-green-700 text-green-800 dark:text-green-100',
  warning:
    'bg-legacy-yellow-100 dark:bg-legacy-yellow-400/60 border-legacy-yellow-700/25 dark:border-legacy-yellow-500 text-legacy-yellow-800 dark:text-legacy-yellow-300',
  danger:
    'bg-legacy-red-100 dark:bg-legacy-red-800 border-legacy-red-800/20 dark:border-legacy-red-700 text-legacy-red-800 dark:text-legacy-red-100',
  info: 'bg-legacy-blue-100 dark:bg-legacy-blue-700 border-legacy-blue-500/20 dark:border-legacy-blue-500 text-legacy-blue-500 dark:text-legacy-blue-100',
};

export type PillVariant = keyof typeof variantsMap;

export type PillSize = 'xs' | 's' | 'm';

export const getSizeStyles = (size: PillSize) => {
  switch (size) {
    case 'xs':
      return {
        styles: 'px-1 py-0 rounded-legacy-l',
        textVariant: 'text-xxxxs-medium' as TextVariant,
        iconSize: 'xs' as IconSize,
      };
    case 's':
      return {
        styles: 'px-2 py-[2px] rounded-legacy-l',
        textVariant: 'text-xxxs-medium' as TextVariant,
        iconSize: 's' as IconSize,
      };
    case 'm':
      return {
        styles: 'px-2 py-1 rounded-legacy-xl',
        textVariant: 'text-xs-medium' as TextVariant,
        iconSize: 'm' as IconSize,
      };
  }
};
