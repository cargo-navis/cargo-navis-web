import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { track } from '@/lib/analytics';
import { Icon } from '@/ui';

import { ChartCardSkeleton } from './ChartCard';
import { FilterRow } from './FilterRow';
import { type Filters, useAnalyticsFilters, type View, VIEWS } from './filters';
import { StatTileSkeleton } from './StatTile';
import { usePeriods } from './usePeriods';
import { Agency, Overview, Regular } from './views';

/**
 * Analitika (DECISIONS §5, lab /analytics): tabs Ukupno · Vlastiti prijevoz · Agencijski nalozi; one filter row (period,
 * Dan / Tjedan / Mjesec / Godina, klijent or vozač / vozilo) kept in the URL; tiles with the change vs the previous
 * period; two charts per tab (shadcn charts on Recharts, one axis each); tables whose rows open the entity.
 */
export const AnalyticsPage = () => {
  const { isReady, today, view, filters, setView, setFilters } = useAnalyticsFilters();

  // Analytics: which filter changed; the value only for period presets and Dan / Tjedan / Mjesec / Godina (never ids).
  function changeFilters(patch: Partial<Filters>) {
    setFilters(patch);
    if (patch.selection) {
      track('analytics filter changed', {
        filter: 'period',
        value: 'preset' in patch.selection ? patch.selection.preset : 'custom',
      });
    } else if (patch.granularity) {
      track('analytics filter changed', { filter: 'granularity', value: patch.granularity });
    } else {
      const filter = (['client', 'driver', 'vehicle'] as const).find((key) => key in patch && patch[key]);
      if (filter) track('analytics filter changed', { filter });
    }
  }

  return (
    <DashboardLayout>
      <PageTitle title="Analitika" />
      <div className="flex flex-col gap-4">
        <h1 className="font-heading text-3xl font-bold tracking-tight">Analitika</h1>
        <Tabs
          value={view}
          onValueChange={(value) => {
            setView(value as View);
            track('analytics view changed', { view: value as string });
          }}
        >
          <TabsList className="no-scrollbar max-w-full overflow-x-auto" variant="line">
            {VIEWS.map((item) => (
              <TabsTrigger key={item.key} value={item.key}>
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {/* The page is statically optimised: the filters come from the URL once the router is ready. */}
        {isReady ? (
          <>
            <FilterRow filters={filters} today={today} view={view} onChange={(patch) => changeFilters(patch)} />
            <AnalyticsContent filters={filters} today={today} view={view} />
          </>
        ) : (
          <AnalyticsSkeleton />
        )}
      </div>
    </DashboardLayout>
  );
};

function AnalyticsContent({ view, filters, today }: { view: View; filters: Filters; today: Date }) {
  const data = usePeriods(filters, today);

  if (data.isError) {
    return (
      <div className="rounded-xl border">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="danger">
              <Icon icon="IconAlertTriangle" size="m" />
            </EmptyMedia>
            <EmptyTitle>Analitika se nije učitala</EmptyTitle>
            <EmptyDescription>Provjeri vezu pa pokušaj ponovno.</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" onClick={data.refetch}>
              <Icon data-icon="inline-start" icon="IconRefresh" size="s" /> Pokušaj ponovno
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  // First load only; a filter change keeps the previous numbers (dimmed).
  if (!data.periods) return <AnalyticsSkeleton withoutFilters />;

  const props = { filters, today, data: { ...data, periods: data.periods } };
  if (view === 'regular') return <Regular {...props} />;
  if (view === 'agency') return <Agency {...props} />;
  return <Overview {...props} />;
}

function AnalyticsSkeleton({ withoutFilters }: { withoutFilters?: boolean }) {
  return (
    <div aria-busy className="flex flex-col gap-4">
      {!withoutFilters && <div className="h-10" />}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <StatTileSkeleton key={index} />
        ))}
      </div>
      <div className="grid gap-4 2xl:grid-cols-2">
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>
    </div>
  );
}
