import clsx from 'clsx';
import { variantMap } from '@/ui/theme/fontSizes';

export const classnames = {
  wrapper: clsx(
    // 'h-[44px]',
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
    // 'hover:border-dark-300 hover:dark:border-light-700',
    // 'focus:border-blue-400 focus:dark:border-orange-400 active:border-blue-400 active:dark:border-orange-400',
    variantMap['text-s'],
  ),
}