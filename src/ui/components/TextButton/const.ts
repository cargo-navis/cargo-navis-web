import mapValues from 'lodash/mapValues';
import omit from 'lodash/omit';

import type { IconSize } from '@/ui';
import type { TextVariant } from '@/ui/theme/fontSizes';

export const sizesMap: Record<string, { textVariant: TextVariant; iconSize: IconSize }> = {
  s: { textVariant: 'text-xxs-medium', iconSize: 's' },
  m: { textVariant: 'text-s-medium', iconSize: 'm' },
  l: { textVariant: 'text-m-medium', iconSize: 'l' },
};
export type Size = keyof typeof sizesMap;

export const variantStyles = {
  primary: {
    normal: 'text-dark-600 dark:text-light-300',
    hover: 'hover:text-dark-800 hover:dark:text-light-400 focus:text-dark-800 focus:dark:text-light-400',
    active: 'active:text-dark-900 active:dark:text-light-600',
    disabled: 'disabled:opacity-50',
    disabledAnchor: 'opacity-50',
  },
  secondary: {
    normal: 'text-teal-500 dark:text-teal-400',
    hover: 'hover:text-teal-400 hover:dark:text-teal-500 focus:text-teal-400 focus:dark:text-teal-500',
    active: 'active:text-teal-600 active:dark:text-teal-600',
    disabled: 'disabled:opacity-50',
    disabledAnchor: 'opacity-50',
  },
  light: {
    normal: 'text-white',
    hover: 'hover:text-light-100 focus:text-light-100',
    active: 'active:text-light-200',
    disabled: 'disabled:opacity-30',
    disabledAnchor: 'opacity-30',
  },
};
export type Variant = keyof typeof variantStyles;
export const variantsMap = mapValues(variantStyles, (o) => Object.values(omit(o, 'disabledAnchor')).join(' '));
