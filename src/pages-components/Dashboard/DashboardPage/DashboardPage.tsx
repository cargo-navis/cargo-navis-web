import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { Box, FlexLayout, Heading } from '@/ui';

import { AlertsCard } from './components/AlertsCard';
import { MonthlyShipmentsCard } from './components/MonthlyShipmentsCard';
import { NotificationsCard } from './components/NotificationsCard';
import { TodayShipmentsCard } from './components/TodayShipmentsCard';

export const DashboardPage = () => {
  return (
    <DashboardLayout>
      <PageTitle title="Nadzorna ploča" />
      <FlexLayout className="flex-col">
        <Heading as="h1" variant="text-xl">
          Početna
        </Heading>
      </FlexLayout>
      <Box className="py-5">
        <Box className="grid grid-cols-1 gap-6 xl:grid-cols-2 max-w-[1400px]">
          <TodayShipmentsCard />
          <MonthlyShipmentsCard />
          <NotificationsCard />
          <AlertsCard />
        </Box>
      </Box>
    </DashboardLayout>
  );
};
