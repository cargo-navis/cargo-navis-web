export const variantsMap = {
  danger: 'bg-red-100 dark:bg-red-700/40 text-red-800 dark:text-red-100',
  warning: 'bg-orange-100 dark:bg-orange-700/60 text-orange-800 dark:text-orange-100',
  info: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-100',
  success: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-100',
};

export type AlertVariant = keyof typeof variantsMap;
