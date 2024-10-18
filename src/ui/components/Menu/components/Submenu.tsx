import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

import { Box } from '@/ui';

import { itemsMap, menuStyles } from '../const';
import type { MenuComponent } from '../types.d';
import { MenuItemContent, type MenuItemProps } from './MenuItem';

export interface SubmenuProps {
  triggerItem: Omit<MenuItemProps, 'href' | 'target' | 'onClick' | 'isActive'>;
  items: MenuComponent[];
  onSubmenuTriggerClick?(items: MenuComponent[]): void;
}

export const Submenu: React.FC<SubmenuProps> = ({ triggerItem, items, onSubmenuTriggerClick }) => {
  const { isDisabled, ...rest } = triggerItem;

  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger asChild disabled={isDisabled}>
        <MenuItemContent {...rest} />
      </DropdownMenu.SubTrigger>
      <DropdownMenu.SubContent asChild loop sideOffset={-8}>
        <Box className={`${menuStyles} max-h-[--radix-dropdown-menu-content-available-height] z-[2]`}>
          {items.map(({ type, ...rest }, index) => {
            const MenuComponent = itemsMap[type];
            return MenuComponent ? <MenuComponent key={index} {...rest} /> : null;
          })}
        </Box>
      </DropdownMenu.SubContent>
    </DropdownMenu.Sub>
  );
};
