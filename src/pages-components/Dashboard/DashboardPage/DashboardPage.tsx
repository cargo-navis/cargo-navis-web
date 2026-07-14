import 'dayjs/locale/hr';

import dayjs from 'dayjs';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { Box, FlexLayout, Heading, Text } from '@/ui';

import { AlertsCard } from './components/AlertsCard';
import { MonthlyShipmentsCard } from './components/MonthlyShipmentsCard';
import { NotificationsCard } from './components/NotificationsCard';
import { TodayStopsCard } from './components/TodayStopsCard';

dayjs.locale('hr');

export const DashboardPage = () => {
  const today = dayjs().format('dddd, D. MMMM YYYY.');
  const formattedDate = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <DashboardLayout>
      <PageTitle title="Nadzorna ploča" />
      <FlexLayout className="flex-col">
        <Heading as="h1" variant="text-xl">
          Početna
        </Heading>
        <Text color="text-color-3" variant="text-s">
          {formattedDate}
        </Text>
      </FlexLayout>
      <Box className="py-5">
        <Box className="grid grid-cols-1 gap-6 xl:grid-cols-2 max-w-[1400px]">
          <TodayStopsCard />
          <MonthlyShipmentsCard />
          <NotificationsCard />
          <AlertsCard />
        </Box>
      </Box>
    </DashboardLayout>
  );
};
