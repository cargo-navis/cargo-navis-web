import type { ALIGN_OPTIONS, SIDE_OPTIONS } from '@radix-ui/react-popper';

import type { MenuCustomProps } from './components/MenuCustom';
import type { MenuItemProps } from './components/MenuItem';
import type { MenuLabelProps } from './components/MenuLabel';
import type { SubmenuProps } from './components/Submenu';

export type ItemRenderer = 'item' | 'divider' | 'label' | 'submenu' | 'custom';

type MenuItemType = { type: 'item' } & MenuItemProps;
type MenuDividerType = { type: 'divider' };
type MenuLabelType = { type: 'label' } & MenuLabelProps;
type MenuSubmenuType = { type: 'submenu' } & SubmenuProps;
type MenuCustomType = { type: 'custom' } & MenuCustomProps;

export type MenuComponent = MenuItemType | MenuDividerType | MenuLabelType | MenuSubmenuType | MenuCustomType;

export type Side = (typeof SIDE_OPTIONS)[number];
export type Align = (typeof ALIGN_OPTIONS)[number];
export type Position = `${Side}-${Align}`;
