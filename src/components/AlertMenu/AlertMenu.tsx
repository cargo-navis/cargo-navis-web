import Link from 'next/link';
import { forwardRef } from 'react';
import { useToggle } from 'react-use';

import type { Alert } from '@/lib/api';
import { useAlerts } from '@/lib/hooks';
import { FlexLayout, Icon, Menu, Text } from '@/ui';
import type { MenuComponent } from '@/ui/components/Menu/types';

import { AlertButton } from './AlertMenuButton';
import { mapToMenuItems } from './utils';

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

  if (alerts) {
    items = mapToMenuItems(alerts);

    if (items.length > 4) {
      items = items.splice(0, 4);
      items.push(seeMoreItem);
    }
  } else {
    items = [loadingItem];
  }

  return items;
}

const loadingItem: MenuComponent = {
  type: 'custom',
  Renderer: () => (
    <FlexLayout className="justify-center items-center px-3 py-7">
      <Text variant="text-s" color="text-color-3">
        Loading...
      </Text>
    </FlexLayout>
  ),
};

const SeeMoreItem = forwardRef((props, ref) => (
  <Link href="/dashboard">
    <FlexLayout
      className={`
        justify-center items-center gap-2 py-3 
        hover:bg-dark-50 hover:dark:bg-light-800 data-[highlighted]:bg-dark-50 data-[highlighted]:dark:bg-light-800 
        outline-0
      `}
      ref={ref}
      {...props}
    >
      <Text variant="text-s" color="text-color-2">
        See more
      </Text>
      <Icon icon="ArrowRightIcon" />
    </FlexLayout>
  </Link>
));

SeeMoreItem.displayName = 'SeeMoreItem';

const seeMoreItem: MenuComponent = {
  type: 'custom',
  Renderer: SeeMoreItem,
};
