import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export interface MenuCustomProps {
  Renderer: React.ReactNode;
}

export const MenuCustom: React.FC<MenuCustomProps> = ({ Renderer }) => {
  return <DropdownMenu.Item asChild>{Renderer}</DropdownMenu.Item>;
};
