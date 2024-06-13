export const fontSize: Record<string, string | [string, string]> = {
  xxxs: ['11px', '16px'],
  xxs: ['13px', '24px'],
  xs: ['14px', '24px'],
  s: ['16px', '24px'],
  m: ['18px', '32px'],
  l: ['24px', '40px'],
  xl: ['32px', '40px'],
  xxl: ['40px', '48px'],
  xxxl: ['56px', '64px'],
  'mobile-override': '16px',
};

export const variantMap = {
  'text-xxxl': 'text-xxxl font-normal',
  'text-xxl': 'text-xxl font-normal',
  'text-xl': 'text-xl font-normal',
  'text-l': 'text-l font-normal',
  'text-m': 'text-m font-normal',
  'text-s': 'text-s font-normal',
  'text-xs': 'text-xs font-normal',
  'text-xxs': 'text-xxs font-normal',
  'text-xxxs': 'text-xxxs font-normal',
  'text-xxxl-medium': 'text-xxxl font-semibold',
  'text-xxl-medium': 'text-xxl font-semibold',
  'text-xl-medium': 'text-xl font-semibold',
  'text-l-medium': 'text-l font-semibold',
  'text-m-medium': 'text-m font-semibold',
  'text-s-medium': 'text-s font-semibold',
  'text-xs-medium': 'text-xs font-semibold',
  'text-xxs-medium': 'text-xxs font-semibold',
  'text-xxxs-medium': 'text-xxxs font-semibold',
  'text-xxxl-bold': 'text-xxxl font-bold',
  'text-xxl-bold': 'text-xxl font-bold',
  'text-xl-bold': 'text-xl font-bold',
  'text-l-bold': 'text-l font-bold',
  'text-m-bold': 'text-m font-bold',
  'text-s-bold': 'text-s font-bold',
  'text-xs-bold': 'text-xs font-bold',
  'text-xxs-bold': 'text-xxs font-bold',
  'text-xxxs-bold': 'text-xxxs font-bold',
};
export type TextVariant = keyof typeof variantMap;

export const colorMap = {
  'text-color-1': 'text-dark-800 dark:text-light-50',
  'text-color-2': 'text-dark-700 dark:text-light-100',
  'text-color-3': 'text-dark-600 dark:text-light-300',
  'text-color-4': 'text-dark-500 dark:text-light-300',
};
export type TextColorToken = keyof typeof colorMap;