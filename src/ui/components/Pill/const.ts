export const variantsMap = {
  default: 'bg-dark-50 dark:bg-light-800 text-dark-800 dark:text-light-100',
  success: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100',
  warning: 'bg-yellow-100 dark:bg-yellow-400 text-yellow-800 dark:text-yellow-900',
  danger: 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-100',
  info: 'bg-blue-100 dark:bg-blue-700 text-blue-500 dark:text-blue-100',
};

export type PillVariant = keyof typeof variantsMap;
