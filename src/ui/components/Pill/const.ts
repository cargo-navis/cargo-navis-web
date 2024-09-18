import { TextVariant } from '@/ui/theme/fontSizes';
import clsx from 'clsx';

export const variantsMap = {
  default: 'bg-dark-50 dark:bg-light-800 text-dark-800 dark:text-light-100',
  success: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100',
  warning: 'bg-yellow-100 dark:bg-yellow-400 text-yellow-800 dark:text-yellow-900',
  danger: 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100',
  info: 'bg-blue-100 dark:bg-blue-700 text-blue-500 dark:text-blue-100',
};

export type PillVariant = keyof typeof variantsMap;

export type PillSize =  's' | 'm';

export const getSizeStyles = (size: PillSize) => {
  switch (size) {
    case 's':
      return {
        styles: 'px-2 py-[2px] rounded-l',
        textVariant: 'text-xxxs-medium' as TextVariant,
      };
    case 'm':
      return {
        styles: 'px-2 py-1 rounded-xl',
        textVariant: 'text-xs-medium' as TextVariant,
      };
  }
};