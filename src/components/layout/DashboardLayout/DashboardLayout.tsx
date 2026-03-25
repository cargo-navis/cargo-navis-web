import { TopBar } from '@/components/layout/DashboardLayout/TopBar';
import { usePushNotificationSubscription } from '@/lib/hooks';
import { Box, FlexLayout } from '@/ui';

import { Sidebar } from './Sidebar';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  usePushNotificationSubscription();

  return (
    <FlexLayout className="min-h-screen">
      <FlexLayout className="shrink-0 translate-x-[-16rem] flex-col fixed left-0 top-0 h-screen w-[256px] py-5 px-4 md:w-64 md:translate-x-0 bg-sidebar-gradient transition ease-in-out overflow-y-auto z-30">
        <Sidebar />
      </FlexLayout>
      <Box as="main" className="flex-grow md:ml-[256px]">
        <TopBar />
        <Box className="p-5 md:p-7">{children}</Box>
      </Box>
    </FlexLayout>
  );
};
