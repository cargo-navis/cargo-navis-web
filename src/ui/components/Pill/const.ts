import type { TextVariant } from '@/ui/theme/fontSizes';

import type { IconSize } from '../Icon/const';

export const variantsMap = {
  default: 'bg-dark-50 dark:bg-light-800 border-light-200/80 dark:border-dark-50/50 text-dark-800 dark:text-light-100',
  success:
    'bg-green-100 dark:bg-green-900 border-green-500/20 dark:border-green-700 text-green-800 dark:text-green-100',
  warning:
    'bg-yellow-100 dark:bg-yellow-400/60 border-yellow-700/25 dark:border-yellow-500 text-yellow-800 dark:text-yellow-300',
  danger: 'bg-red-100 dark:bg-red-800 border-red-800/20 dark:border-red-700 text-red-800 dark:text-red-100',
  info: 'bg-blue-100 dark:bg-blue-700 border-blue-500/20 dark:border-blue-500 text-blue-500 dark:text-blue-100',
};

export type PillVariant = keyof typeof variantsMap;

export type PillSize = 's' | 'm';

export const getSizeStyles = (size: PillSize) => {
  switch (size) {
    case 's':
      return {
        styles: 'px-2 py-[2px] rounded-l',
        textVariant: 'text-xxxs-medium' as TextVariant,
        iconSize: 's' as IconSize,
      };
    case 'm':
      return {
        styles: 'px-2 py-1 rounded-xl',
        textVariant: 'text-xs-medium' as TextVariant,
        iconSize: 'm' as IconSize,
      };
  }
};
