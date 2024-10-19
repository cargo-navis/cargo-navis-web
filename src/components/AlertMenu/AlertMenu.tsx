import Link from 'next/link';
import { forwardRef } from 'react';
import { useToggle } from 'react-use';

import type { Alert } from '@/lib/api';
import { useAlerts } from '@/lib/hooks';
import { FlexLayout, Icon, LoadingSpinner, Menu, Text } from '@/ui';
import type { MenuComponent } from '@/ui/components/Menu/types';

import { AlertButton } from './AlertMenuButton';
import { mapToMenuItems } from './utils';

export const AlertMenu = () => {
  const [isOpen, onToggleIsMenuOpen] = useToggle(false);
  const { data, isLoading } = useAlerts();
  const items = getMenuItems(data, isLoading);

  const areAlertsPresent = !isLoading && !!data && data?.length > 0;

  return (
    <Menu
      isOpen={isOpen}
      onClose={onToggleIsMenuOpen}
      onOpen={onToggleIsMenuOpen}
      items={items}
      minWidth="200px"
      maxWidth="360px"
      control={<AlertButton shouldDisplayIndicator={areAlertsPresent} />}
    />
  );
};

function getMenuItems(alerts: Alert[] | undefined, isLoading: boolean) {
  let items: MenuComponent[];

  if (alerts && alerts.length > 0) {
    items = mapToMenuItems(alerts);

    if (items.length > 4) {
      items = items.splice(0, 4);
      items.push(seeMoreItem);
    }
  } else if (isLoading) {
    items = [loadingItem];
  } else {
    items = [emptyAlertsItem];
  }

  return items;
}

const emptyAlertsItem: MenuComponent = {
  type: 'custom',
  Renderer: () => (
    <FlexLayout className="justify-center items-center p-3">
      <Text variant="text-s" color="text-color-2">
        No new Alerts
      </Text>
    </FlexLayout>
  ),
};

const loadingItem: MenuComponent = {
  type: 'custom',
  Renderer: () => (
    <FlexLayout className="justify-center items-center px-3 py-7">
      <LoadingSpinner />
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
