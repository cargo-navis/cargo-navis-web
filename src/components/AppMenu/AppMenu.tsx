import sortBy from 'lodash/sortBy';
import { useToggle } from 'react-use';

import type { Alert, Notification } from '@/lib/api';
import { useAlerts, useNotifications } from '@/lib/hooks';
import { Menu } from '@/ui';
import { MenuComponent } from '@/ui/components/Menu/types';

import { AppMenuButton } from './AppMenuButton';
import { mapToAlertMenuItems } from './utils/alerts';
import { emptyMenuItem, loadingItem, seeMoreItem } from './utils/misc';
import { mapToNotificationMenuItems } from './utils/notifications';

export const AppMenu = () => {
  const [isOpen, onToggleIsMenuOpen] = useToggle(false);
  const { data: alerts, isLoading: isLoadingAlerts } = useAlerts();
  const { data: notifications, isLoading: isLoadingNotifications } = useNotifications();

  const isLoading = isLoadingAlerts || isLoadingNotifications;

  const items = getMenuItems(alerts, notifications, isLoading);

  const areItemsPresent = !isLoading && !!alerts && alerts?.length > 0 && !!notifications && notifications?.length > 0;

  return (
    <Menu
      control={<AppMenuButton shouldDisplayIndicator={areItemsPresent} />}
      isOpen={isOpen}
      items={items}
      maxWidth="360px"
      minWidth="200px"
      onClose={onToggleIsMenuOpen}
      onOpen={onToggleIsMenuOpen}
    />
  );
};

function getMenuItems(alerts: Alert[] | undefined, notifications: Notification[] | undefined, isLoading: boolean) {
  if (isLoading) return [loadingItem];

  if (!alerts?.length && !notifications?.length) return [emptyMenuItem];

  const notificationItems = mapToNotificationMenuItems(notifications || []);
  const alertItems = mapToAlertMenuItems(alerts || []);

  return mergeAndSortItems(notificationItems, alertItems);
}

function mergeAndSortItems(notificationItems: MenuComponent[], alertItems: MenuComponent[]) {
  const items = [...notificationItems, ...alertItems];
  const sortedItems = sortBy(items, 'createdAt').reverse();

  if (sortedItems.length > 8) {
    const displayItems = sortedItems.slice(0, 8);
    return [...displayItems, seeMoreItem];
  }

  return items;
}
