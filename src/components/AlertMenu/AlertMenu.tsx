import { mapToMenuItems } from '@/components/AlertMenu/utils';
import { Alert } from '@/lib/api';
import { useAlerts } from '@/lib/hooks';
import { FlexLayout, Icon, Menu, Text } from '@/ui';
import type { MenuComponent } from '@/ui/components/Menu/types';
import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';
import { useToggle } from 'react-use';

export const AlertMenu = () => {
  const [isOpen, onToggleIsMenuOpen] = useToggle(false);
  const { data } = useAlerts();
  const items = getMenuItems(data);

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

function getMenuItems(alerts: Alert[] | undefined) {
  let items: MenuComponent[];

  if(alerts) {
    items = mapToMenuItems(alerts);

    if(items.length > 4) {
      items = items.splice(0,4);
      items.push(seeMoreItem)
    }
  } else {
    items = [loadingItem];
  }

  return items;
}

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

const seeMoreItem: MenuComponent = {
  type: 'custom',
  Renderer: (
    <Link href="/dashboard" className="outline-0">
      <FlexLayout className="justify-center items-center gap-2 py-3 hover:bg-dark-50 hover:dark:bg-light-800 data-[highlighted]:bg-dark-50 data-[highlighted]:dark:bg-light-800">
        <Text variant="text-s" color="text-color-2">
          See more
        </Text>
        <Icon icon="ArrowRightIcon" />
      </FlexLayout>
    </Link>
  ),
}

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
