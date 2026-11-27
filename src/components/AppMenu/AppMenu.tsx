import Link from 'next/link';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { track } from '@/lib/analytics';
import type { Alert, Notification } from '@/lib/api';
import { useAlerts, useIsMobile, useNotifications } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { daysFromToday, formatDate, formatDateShort, formatTime } from '@/lib/utils/date';
import { plural } from '@/lib/utils/plural';
import { notificationsHref } from '@/pages-components/Dashboard/NotificationsPage/notifications';
import { Icon } from '@/ui';

import { getAlertItemData } from './utils/alerts';
import { getNotificationItemData } from './utils/notifications';

const MAX_ITEMS = 8;

type Entry =
  | { kind: 'alert'; item: Alert; createdAt: string }
  | { kind: 'notification'; item: Notification; createdAt: string };

/** „danas 08:42”, „jučer 08:42”, „7.11. 08:42”, „7.11.2025.” (other years). */
function formatWhen(value: string) {
  const days = daysFromToday(value);
  if (days === 0) return `danas ${formatTime(value)}`;
  if (days === -1) return `jučer ${formatTime(value)}`;
  const sameYear = new Date(value).getFullYear() === new Date().getFullYear();
  return sameYear ? `${formatDateShort(value)} ${formatTime(value)}` : formatDate(value);
}

function summary(alerts: number, notifications: number) {
  const parts = [
    alerts > 0 && `${alerts} ${plural(alerts, ['upozorenje', 'upozorenja', 'upozorenja'])}`,
    notifications > 0 && `${notifications} ${plural(notifications, ['obavijest', 'obavijesti', 'obavijesti'])}`,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Nema novih upozorenja';
}

/**
 * Bell in the top bar (DECISIONS §4, lab /dashboard top-bar.tsx `Notifications`): today's alerts and notifications,
 * newest first, 8 at most + „Vidi više” (Obavijesti). Popover on desktop, bottom drawer on phones (DECISIONS §3).
 */
export const AppMenu = () => {
  const [open, setOpenState] = React.useState(false);
  const setOpen = (next: boolean) => {
    if (next && !open) track('notifications opened');
    setOpenState(next);
  };
  const isMobile = useIsMobile();
  const { data: alerts, isLoading: isLoadingAlerts } = useAlerts();
  const { data: notifications, isLoading: isLoadingNotifications } = useNotifications();

  const isLoading = isLoadingAlerts || isLoadingNotifications;
  const alertCount = alerts?.length ?? 0;
  const notificationCount = notifications?.length ?? 0;
  const hasItems = !isLoading && alertCount + notificationCount > 0;

  const entries = React.useMemo<Entry[]>(() => {
    const all: Entry[] = [
      ...(alerts ?? []).map((item) => ({ kind: 'alert' as const, item, createdAt: item.createdAt })),
      ...(notifications ?? []).map((item) => ({ kind: 'notification' as const, item, createdAt: item.createdAt })),
    ];
    return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [alerts, notifications]);

  const close = () => setOpen(false);
  const title = 'Obavijesti';
  const description = isLoading ? 'Učitavanje…' : summary(alertCount, notificationCount);
  // „Vidi više” opens Obavijesti on the half that has something: Treba pažnju when there are alerts, else Aktivnost.
  const moreHref = notificationsHref(alertCount > 0 ? 'paznja' : 'aktivnost');
  const list = <EntryList entries={entries} isLoading={isLoading} moreHref={moreHref} onNavigate={close} />;

  const bell = (
    <>
      <Icon icon="IconBell" size="s" />
      {hasItems && (
        <span className="absolute top-2 right-2 size-2 rounded-full bg-warning-dot ring-2 ring-background" />
      )}
    </>
  );

  if (isMobile) {
    return (
      <>
        <Button aria-label="Obavijesti" className="relative" size="icon" variant="ghost" onClick={() => setOpen(true)}>
          {bell}
        </Button>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>{title}</DrawerTitle>
              <DrawerDescription>{description}</DrawerDescription>
            </DrawerHeader>
            <div className="min-h-0 flex-1 overflow-y-auto">{list}</div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button aria-label="Obavijesti" className="relative" size="icon" variant="ghost" />}>
        {bell}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 gap-0 p-0">
        <PopoverHeader className="border-b p-4">
          <PopoverTitle>{title}</PopoverTitle>
          <PopoverDescription>{description}</PopoverDescription>
        </PopoverHeader>
        <div className="max-h-[min(70vh,32rem)] overflow-y-auto">{list}</div>
      </PopoverContent>
    </Popover>
  );
};

function EntryList({
  entries,
  isLoading,
  moreHref,
  onNavigate,
}: {
  entries: Entry[];
  isLoading: boolean;
  moreHref: string;
  onNavigate(): void;
}) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="size-5 text-muted-foreground" />
      </div>
    );
  }

  if (entries.length === 0) {
    return <p className="px-4 py-8 text-center text-sm text-muted-foreground">Nema novih upozorenja.</p>;
  }

  return (
    <ul className="divide-y">
      {entries
        .slice(0, MAX_ITEMS)
        .map((entry) =>
          entry.kind === 'alert' ? (
            <AlertEntry alert={entry.item} key={`alert-${entry.item.id}`} onNavigate={onNavigate} />
          ) : (
            <NotificationEntry
              key={`notification-${entry.item.id}`}
              notification={entry.item}
              onNavigate={onNavigate}
            />
          )
        )}
      {entries.length > MAX_ITEMS && (
        <li>
          <Link
            className="flex items-center justify-center gap-2 p-3 text-sm font-medium text-brand hover:bg-muted/50"
            href={moreHref}
            onClick={onNavigate}
          >
            Vidi više <Icon icon="IconArrowRight" size="s" />
          </Link>
        </li>
      )}
    </ul>
  );
}

const ROW = 'flex gap-3 p-4 outline-none';
const LINK_ROW = 'hover:bg-muted/50 focus-visible:bg-muted/50';

function EntryRow({
  href,
  onNavigate,
  icon,
  children,
  createdAt,
}: {
  href: string;
  onNavigate(): void;
  icon: React.ReactNode;
  children: React.ReactNode;
  createdAt: string;
}) {
  const content = (
    <>
      {icon}
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm text-muted-foreground">{children}</span>
        <span className="text-xs text-muted-foreground tabular-nums">{formatWhen(createdAt)}</span>
      </div>
    </>
  );

  return (
    <li>
      {href ? (
        <Link className={cn(ROW, LINK_ROW)} href={href} onClick={onNavigate}>
          {content}
        </Link>
      ) : (
        <div className={ROW}>{content}</div>
      )}
    </li>
  );
}

function AlertEntry({ alert, onNavigate }: { alert: Alert; onNavigate(): void }) {
  const { targetUrl, plainNode } = getAlertItemData(alert);
  return (
    <EntryRow
      createdAt={alert.createdAt}
      href={targetUrl}
      icon={<Icon className="mt-0.5 text-warning" icon="IconAlertTriangle" size="s" />}
      onNavigate={onNavigate}
    >
      <span className="text-foreground">{plainNode}.</span>
    </EntryRow>
  );
}

function NotificationEntry({ notification, onNavigate }: { notification: Notification; onNavigate(): void }) {
  const { targetUrl, descriptionNode } = getNotificationItemData(notification);
  return (
    <EntryRow
      createdAt={notification.createdAt}
      href={targetUrl}
      icon={<Icon className="mt-0.5 text-muted-foreground" icon="IconBell" size="s" />}
      onNavigate={onNavigate}
    >
      {descriptionNode}
    </EntryRow>
  );
}
