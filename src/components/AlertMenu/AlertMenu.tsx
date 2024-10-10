import { FlexLayout, Icon, Menu, Text } from '@/ui';
import type { MenuComponent } from '@/ui/components/Menu/types';
import { mapToMenuItems } from '@/components/AlertMenu/utils';
import { useAlerts } from '@/lib/hooks';
import clsx from 'clsx';
import React from 'react';
import { useToggle } from 'react-use';

export const AlertMenu = () => {
  const [isOpen, onToggleIsMenuOpen] = useToggle(false);
  const { data } = useAlerts();

  const items: MenuComponent[] = data ? mapToMenuItems(data) : [loadingItem];

  return (
    <Menu
      isOpen={isOpen}
      onClose={onToggleIsMenuOpen}
      onOpen={onToggleIsMenuOpen}
      items={items}
      minWidth="200px"
      maxWidth="360px"
      control={<AlertButton />}
    />
  );
};

const loadingItem: MenuComponent = {
  type: 'custom',
  Renderer: (
    <FlexLayout className="justify-center items-center px-3 py-7">
      <Text variant="text-s" color="text-color-3">
        Loading...
      </Text>
    </FlexLayout>
  ),
};

const AlertButton = React.forwardRef((props, ref) => (
  <FlexLayout
    {...props}
    ref={ref}
    className={clsx(
      'group relative p-2 justify-center items-center rounded-s isolate',
      'hover:bg-light-50 hover:text-teal-900 cursor-pointer',
      'data-[state=open]:bg-light-50 data-[state=open]:text-teal-900 cursor-pointer',
      `before:content-[''] before:absolute before:z-20 before:top-[6px] before:right-[8px] before:w-[10px] before:h-[10px] before:rounded-circle before:bg-red-500`,
    )}
  >
    <Icon
      icon="BellIcon"
      size="l"
      className="transition-transform group-hover:scale-110 group-focus:scale-110 duration-100 z-1"
    />
  </FlexLayout>
));
