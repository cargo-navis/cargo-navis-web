import mapValues from 'lodash/mapValues';
import omit from 'lodash/omit';
import { TextVariant } from '@/ui/theme/fontSizes';
import { IconSize, LoadingSpinnerSize } from '@/ui';


type SizeMap = Record<
  string,
  {
    sizeStyles: string; textVariant: TextVariant; iconSize: IconSize;
    loadingSize: LoadingSpinnerSize
  }
>;
export const sizesMap: SizeMap = {
  s: { sizeStyles: 'h-[32px] rounded-s px-2 py-1', textVariant: 'text-xxs-medium', iconSize: 's',
    loadingSize: 's'
  },
  m: { sizeStyles: 'h-[40px] rounded-m px-3 py-2', textVariant: 'text-xs-medium', iconSize: 'm',
    loadingSize: 'm'
  },
  l: { sizeStyles: 'h-[48px] rounded-m px-5 py-3', textVariant: 'text-s-medium', iconSize: 'm',
    loadingSize: 'm'
  },
};
export type Size = keyof typeof sizesMap;

export const variantStyles = {
  primary: {
    normal: 'bg-teal-700 dark:bg-teal-600 text-white dark:text-dark-75',
    hover: 'hover:enabled:bg-teal-800 hover:enabled:dark:bg-teal-500',
    focus: 'focus:shadow-[0_0_0_4px] focus:shadow-teal-500 focus:dark:shadow-teal-700',
    active: 'active:enabled:bg-teal-700 active:enabled:dark:bg-teal-500',
    disabled: 'disabled:opacity-25',
    disabledAnchor: 'opacity-25',
  },
  secondary: {
    normal:
      'bg-white dark:bg-transparent text-dark-800 dark:text-light-50 border border-dark-200 dark:border-light-800 leading-[22px]',
    hover:
      'hover:bg-black-alpha-05 hover:dark:white-alpha-05 hover:text-dark-800 hover:dark:text-light-50 hover:border-dark-300 hover:dark:border-light-700',
    focus:
      'focus:bg-white focus:dark:bg-black-alpha-05 focus:shadow-[0_0_0_4px] focus:shadow-dark-50 focus:dark:shadow-white-alpha-10',
    active:
      'active:bg-dark-200 active:dark:bg-white-alpha-05 active:text-dark-700 active:dark:text-light-200 active:border-dark-300 active:dark:border-light-700',
    disabled:
      'disabled:bg-white disabled:dark:bg-transparent disabled:text-dark-800 disabled:dark:text-light-800 disabled:border-dark-200 disabled:dark:border-light-800 disabled:opacity-40 disabled:dark:opacity-50',
    disabledAnchor:
      'bg-white dark:bg-transparent text-dark-800 dark:text-light-800 border-dark-200 dark:border-light-800 opacity-40 dark:opacity-50',
  },
};

export const variantsMap = mapValues(variantStyles, (o) => Object.values(omit(o, 'disabledAnchor')).join(' '));
export type Variant = keyof typeof variantsMap;
