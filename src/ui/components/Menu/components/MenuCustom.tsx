import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { forwardRef } from 'react';

export interface MenuCustomProps {
  Renderer: React.FC<any>;
}

export const MenuCustom = forwardRef<any, MenuCustomProps>(({ Renderer, ...props }, ref) => {
  return (
    <DropdownMenu.Item asChild>
      <Renderer {...props} ref={ref} />
    </DropdownMenu.Item>
  );
});
