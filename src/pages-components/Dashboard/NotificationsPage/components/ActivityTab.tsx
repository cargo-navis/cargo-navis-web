import Link from 'next/link';
import * as React from 'react';

import { getNotificationItemData } from '@/components/AppMenu/utils/notifications';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import type { Notification } from '@/lib/api';
import { useReadAllNotifications, useReadNotification } from '@/lib/hooks/api';
import { cn } from '@/lib/utils';
import { formatTime } from '@/lib/utils/date';
import { initials } from '@/lib/utils/initials';
import { showErrorToast } from '@/lib/utils/toast';
import { Icon } from '@/ui';

import type { Lookups } from '../../DashboardPage/useHomeData';
import { groupByDay } from '../notifications';
import { ListEmpty, ListError, ListSection, ListSkeleton, ROW, ROW_INTERACTIVE } from './parts';

function ActivityRow({
  notification,
  lookups,
  onRead,
}: {
  notification: Notification;
  lookups: Lookups;
  onRead(notification: Notification): void;
}) {
  const { targetUrl, descriptionNode, driverId } = getNotificationItemData(notification);
  const name = (driverId && lookups.employeesById.get(driverId)?.fullName) || notification.metadata?.driverName;
  const unread = !notification.isRead;

  const content = (
    <>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[0.6875rem] font-medium text-muted-foreground">
        {name ? initials(name) : <Icon className="size-3.5! [&_svg]:size-full!" icon="IconInbox" />}
      </span>
      <span className="min-w-0 flex-1 text-sm text-muted-foreground">{descriptionNode}</span>
      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{formatTime(notification.createdAt)}</span>
      <span
        aria-label={unread ? 'Nepročitano' : undefined}
        className={cn('mt-1.5 size-2 shrink-0 rounded-full', unread ? 'bg-primary' : 'bg-transparent')}
      />
    </>
  );

  // Rows without a target carry links in their text (no link inside a link): a click anywhere still marks them read.
  return targetUrl ? (
    <Link className={cn(ROW, ROW_INTERACTIVE)} href={targetUrl} onClick={() => onRead(notification)}>
      {content}
    </Link>
  ) : (
    <div className={ROW} onClick={() => onRead(notification)}>
      {content}
    </div>
  );
}

/** „Aktivnost”: Sve / Nepročitane, „Označi sve pročitanim”, newest first by day; a click marks a row read. */
export function ActivityTab({
  notifications,
  isError,
  onRetry,
  lookups,
  today,
}: {
  notifications: Notification[] | undefined;
  isError: boolean;
  onRetry(): void;
  lookups: Lookups;
  today: Date;
}) {
  const [unreadOnly, setUnreadOnly] = React.useState(false);
  const readOne = useReadNotification();
  const readAll = useReadAllNotifications();

  const unread = notifications?.filter((notification) => !notification.isRead).length ?? 0;
  const days = React.useMemo(
    () =>
      groupByDay(
        (notifications ?? []).filter((notification) => !unreadOnly || !notification.isRead),
        today
      ),
    [notifications, unreadOnly, today]
  );

  function markRead(notification: Notification) {
    if (!notification.isRead) readOne.mutate(notification.id);
  }

  function markAllRead() {
    readAll.mutate(undefined, {
      onError: () => showErrorToast({ title: 'Označavanje nije uspjelo. Pokušaj ponovno.' }),
    });
  }

  let list: React.ReactNode;
  if (isError) list = <ListError title="Aktivnost se nije učitala" onRetry={onRetry} />;
  else if (!notifications) list = <ListSkeleton avatar />;
  else if (days.length === 0) {
    list = unreadOnly ? (
      <ListEmpty icon="IconChecks" title="Sve je pročitano" variant="success" />
    ) : (
      <ListEmpty icon="IconInbox" title="Nema obavijesti" />
    );
  } else {
    list = (
      <div className="flex flex-col gap-4">
        {days.map((day) => (
          <ListSection key={day.key} title={day.label}>
            {day.items.map((notification) => (
              <ActivityRow key={notification.id} lookups={lookups} notification={notification} onRead={markRead} />
            ))}
          </ListSection>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ButtonGroup>
          <Button
            aria-pressed={!unreadOnly}
            variant={!unreadOnly ? 'secondary' : 'outline'}
            onClick={() => setUnreadOnly(false)}
          >
            Sve
          </Button>
          <Button
            aria-pressed={unreadOnly}
            variant={unreadOnly ? 'secondary' : 'outline'}
            onClick={() => setUnreadOnly(true)}
          >
            Nepročitane <span className="text-muted-foreground tabular-nums">{unread}</span>
          </Button>
        </ButtonGroup>
        <Button disabled={unread === 0} loading={readAll.isPending} variant="outline" onClick={markAllRead}>
          <Icon data-icon="inline-start" icon="IconChecks" size="s" />
          Označi sve pročitanim
        </Button>
      </div>
      {list}
    </>
  );
}
