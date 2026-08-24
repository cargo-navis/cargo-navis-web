import { useState } from 'react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { ClientSideOnly } from '@/lib/components/ClientSideOnly';
import { FlexLayout, Heading } from '@/ui';

import { AnalyticsPageTabs } from './AnalyticsPageTabs';
import { ContentLoader } from './ContentLoader';
import { DateRange, getInitialDateRange } from './DateRangeFilter';
import { GranularityOption } from './GranularityFilter';
import { useAnalyticsPageTab } from './hooks';
import { AgencySection, OverviewSection, RegularSection } from './sections';

export const AnalyticsPage = () => {
  const { isReady, tab, setTab } = useAnalyticsPageTab();
  const [dateRange, setDateRange] = useState<DateRange>(() => getInitialDateRange('last-6-months'));
  const [granularity, setGranularity] = useState<GranularityOption>('month');

  // Date range and granularity are shared, so switching tabs keeps the period in view.
  const sharedFilterProps = {
    dateRange,
    granularity,
    onDateRangeChange: setDateRange,
    onGranularityChange: setGranularity,
  };

  return (
    <DashboardLayout>
      <PageTitle title="Analitika" />
      <FlexLayout className="flex-col gap-5">
        <FlexLayout className="flex-col gap-4">
          <Heading as="h1" variant="text-xl">
            Analitika
          </Heading>
          {isReady && <AnalyticsPageTabs setTab={setTab} tab={tab} />}
        </FlexLayout>
        {!isReady && (
          <ClientSideOnly>
            <ContentLoader />
          </ClientSideOnly>
        )}
        {isReady && tab === 'overview' && <OverviewSection {...sharedFilterProps} />}
        {isReady && tab === 'regular' && <RegularSection {...sharedFilterProps} />}
        {isReady && tab === 'agency' && <AgencySection {...sharedFilterProps} />}
      </FlexLayout>
    </DashboardLayout>
  );
};
