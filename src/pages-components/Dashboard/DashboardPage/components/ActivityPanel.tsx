import Link from 'next/link';
import * as React from 'react';

import { getNotificationItemData } from '@/components/AppMenu/utils/notifications';
import { Panel } from '@/components/shared/panel';
import { Skeleton } from '@/components/ui/skeleton';
import type { Notification } from '@/lib/api';
import { useNotifications } from '@/lib/hooks/api';
import { cn } from '@/lib/utils';
import { initials } from '@/lib/utils/initials';
import { Icon } from '@/ui';

import { formatAgo } from '../format';
import type { Lookups } from '../useHomeData';
import { RetryLine } from './RetryLine';

const LIMIT = 5;

function ActivityRow({ notification, lookups }: { notification: Notification; lookups: Lookups }) {
  const { targetUrl, descriptionNode, driverId } = getNotificationItemData(notification);
  const name = (driverId && lookups.employeesById.get(driverId)?.fullName) || notification.metadata?.driverName;

  const content = (
    <>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[0.6875rem] font-medium text-muted-foreground">
        {name ? initials(name) : <Icon className="size-3.5! [&_svg]:size-full!" icon="IconInbox" />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-sm text-muted-foreground">{descriptionNode}</span>
        <span className="text-xs text-muted-foreground tabular-nums">{formatAgo(notification.createdAt)}</span>
      </span>
      {!notification.isRead && <span aria-label="Novo" className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />}
    </>
  );

  const className = 'flex w-full items-start gap-3 px-4 py-2.5 text-left';
  // Rows without a target carry links in their text (no link inside a link).
  return targetUrl ? (
    <Link className={cn(className, 'outline-none hover:bg-muted/50 focus-visible:bg-muted/50')} href={targetUrl}>
      {content}
    </Link>
  ) : (
    <div className={className}>{content}</div>
  );
}

/** „Aktivnost”: today's notifications (drivers confirming stops, documents, drafts), newest first (lab /home). */
export function ActivityPanel({ lookups }: { lookups: Lookups }) {
  const { data, isError, refetch } = useNotifications();
  const [showAll, setShowAll] = React.useState(false);
  const notifications = React.useMemo(
    () => (data ? [...data].sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : undefined),
    [data]
  );
  const visible = showAll ? notifications : notifications?.slice(0, LIMIT);

  return (
    <Panel bodyClassName="p-0" title="Aktivnost">
      {isError && !data ? (
        <RetryLine text="Aktivnost se nije učitala." onRetry={() => void refetch()} />
      ) : !notifications ? (
        <div className="divide-y">
          {Array.from({ length: 3 }, (_, index) => (
            <div className="flex items-start gap-3 px-4 py-2.5" key={index}>
              <Skeleton className="size-7 rounded-full" />
              <span className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-3 w-16" />
              </span>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <p className="px-4 py-4 text-sm text-muted-foreground">Nema novih obavijesti.</p>
      ) : (
        <>
          <div className="divide-y">
            {visible!.map((notification) => (
              <ActivityRow key={notification.id} lookups={lookups} notification={notification} />
            ))}
          </div>
          {notifications.length > LIMIT && (
            <button
              className="w-full border-t px-4 py-2 text-left text-sm text-muted-foreground outline-none hover:text-foreground focus-visible:text-foreground"
              type="button"
              onClick={() => setShowAll((value) => !value)}
            >
              {showAll ? 'Prikaži manje' : `Još ${notifications.length - LIMIT}…`}
            </button>
          )}
        </>
      )}
    </Panel>
  );
}
