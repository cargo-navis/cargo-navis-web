import { TopBar } from '@/components/layout/DashboardLayout/TopBar';
import { Box, FlexLayout } from '@/ui';

import { Sidebar } from './Sidebar';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <FlexLayout className="h-screen">
      <Box className="shrink-0 translate-x-[-16rem] flex flex-col absolute h-screen w-[256px] py-5 px-4 md:static md:h-auto md:w-64 md:translate-x-0 bg-sidebar-gradient transition ease-in-out">
        <Sidebar />
      </Box>
      <Box as="main" className="flex-grow overflow-y-auto">
        <TopBar />
        <Box className="p-5 md:p-7">{children}</Box>
      </Box>
    </FlexLayout>
  );
};
