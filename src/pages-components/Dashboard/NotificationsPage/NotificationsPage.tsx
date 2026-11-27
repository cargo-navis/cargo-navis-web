import { useRouter } from 'next/router';
import * as React from 'react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotifications } from '@/lib/hooks/api';

import { useLookups, useWarnings } from '../DashboardPage/useHomeData';
import { ActivityTab } from './components/ActivityTab';
import { AlertsTab } from './components/AlertsTab';
import { type NotificationsTab, tabFromQuery } from './notifications';

/**
 * Obavijesti (lab /notifications, option A): where Početna's „Još N…” and the bell's „Vidi više” lead. Two line tabs in
 * `?tab=paznja|aktivnost`:
 * - Treba pažnju (getAlerts, incl. overdue invoices): a to-do list grouped by kind, each group linking to the list
 *   that owns it. No read state: an item goes away once it's fixed.
 * - Aktivnost (getNotifications): a feed by day, read / unread, „Označi sve pročitanim”.
 * Neither API pages its results, so both lists load in full.
 */
export const NotificationsPage = () => {
  const router = useRouter();
  const tab = tabFromQuery(router.query.tab);
  // One „today” per visit, so the derived days stay stable while the page is open.
  const [today] = React.useState(() => new Date());
  const lookups = useLookups();
  const { warnings, isError: warningsError, refetch: refetchWarnings } = useWarnings(lookups, today);
  const notifications = useNotifications();

  const expired = warnings?.filter((warning) => warning.severity === 'expired').length ?? 0;
  const unread = notifications.data?.filter((notification) => !notification.isRead).length ?? 0;

  function setTab(next: NotificationsTab) {
    if (next === tab) return;
    const { tab: _tab, ...rest } = router.query;
    const query = next === 'paznja' ? rest : { ...rest, tab: next };
    void router.push({ pathname: router.pathname, query }, undefined, { shallow: true });
  }

  return (
    <DashboardLayout>
      <PageTitle title="Obavijesti" />
      <div className="flex max-w-5xl min-w-0 flex-col gap-5">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Obavijesti</h1>
        <Tabs value={tab} onValueChange={(value) => setTab(value as NotificationsTab)}>
          <TabsList variant="line">
            <TabsTrigger value="paznja">
              Treba pažnju
              {expired > 0 && (
                <Badge look="solid" size="sm" tone="brand">
                  {expired}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="aktivnost">
              Aktivnost
              {unread > 0 && (
                <Badge look="solid" size="sm" tone="brand">
                  {unread}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {tab === 'paznja' ? (
          <AlertsTab isError={warningsError} warnings={warnings} onRetry={() => void refetchWarnings()} />
        ) : (
          <ActivityTab
            isError={notifications.isError && !notifications.data}
            lookups={lookups}
            notifications={notifications.data}
            today={today}
            onRetry={() => void notifications.refetch()}
          />
        )}
      </div>
    </DashboardLayout>
  );
};
