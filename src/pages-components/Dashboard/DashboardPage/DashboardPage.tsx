import * as React from 'react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { useCurrentUser } from '@/lib/hooks/api';
import { plural } from '@/lib/utils/plural';

import { ActivityPanel } from './components/ActivityPanel';
import { KpiStrip } from './components/KpiStrip';
import { TodayPanel } from './components/TodayPanel';
import { WarningsPanel } from './components/WarningsPanel';
import { greeting } from './format';
import { useCounts, useLookups, useTodayStops, useWarnings } from './useHomeData';

/**
 * Početna (DECISIONS §5, lab /home): 5 shortcut tiles (Danas utovara, Danas istovara, Nefakturirano, Dospjelo
 * neplaćeno, Nalozi · zadnjih 7 dana with a sparkline), the main „Danas” list, and on the right „Treba pažnju” +
 * „Aktivnost”. Every block uses a call that exists today.
 */
export const DashboardPage = () => {
  // One „today” per visit, so the queries' keys stay stable while the page is open.
  const [today] = React.useState(() => new Date());
  const lookups = useLookups();
  const { data: user } = useCurrentUser();
  const { active } = useCounts();
  const todayStops = useTodayStops(today);
  const { warnings, isError: warningsError, refetch: refetchWarnings } = useWarnings(lookups, today);

  // Oldest overdue invoice (days past due) for the „Dospjelo, neplaćeno” tile.
  const overdueOldestDays = React.useMemo(() => {
    const days = (warnings ?? [])
      .filter((warning) => warning.kind === 'invoice' && warning.days !== undefined)
      .map((warning) => -warning.days!);
    return days.length > 0 ? Math.max(...days) : undefined;
  }, [warnings]);

  return (
    <DashboardLayout>
      <PageTitle title="Početna" />
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 className="font-heading text-3xl font-bold tracking-tight">Početna</h1>
          <span className="text-sm text-muted-foreground">
            {[
              user?.firstName ? `${greeting()}, ${user.firstName}` : greeting(),
              active !== undefined &&
                `${active.toLocaleString('hr-HR')} ${plural(active, ['aktivan nalog', 'aktivna naloga', 'aktivnih naloga'])}`,
            ]
              .filter(Boolean)
              .join(' · ')}
          </span>
        </div>
        <KpiStrip
          overdueOldestDays={overdueOldestDays}
          stops={todayStops.stops}
          stopsError={todayStops.isError ? { onRetry: todayStops.refetch } : undefined}
          today={today}
        />
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <TodayPanel
            isError={todayStops.isError}
            lookups={lookups}
            stops={todayStops.stops}
            today={today}
            onRetry={todayStops.refetch}
          />
          <div className="flex min-w-0 flex-col gap-5">
            <WarningsPanel isError={warningsError} warnings={warnings} onRetry={() => void refetchWarnings()} />
            <ActivityPanel lookups={lookups} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
