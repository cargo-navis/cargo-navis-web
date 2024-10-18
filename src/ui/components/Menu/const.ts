import { MenuCustom, MenuDivider, MenuItem, MenuLabel, Submenu } from './components';
import type { ItemRenderer } from './types';

export const menuStyles =
  'overflow-auto py-2 rounded-m bg-white dark:bg-light-850 border border-dark-100 dark:border-light-800 shadow-menu';

export const itemsMap: Record<ItemRenderer, React.FC<any>> = {
  item: MenuItem,
  divider: MenuDivider,
  label: MenuLabel,
  submenu: Submenu,
  custom: MenuCustom,
};
