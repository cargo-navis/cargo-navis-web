import { Sidebar } from './(sidenav)/Sidebar';
import { Box } from '@/ui';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box className="h-screen flex flex-row">
      <Box className="translate-x-[-16rem] flex flex-col absolute h-screen w-64  py-6 px-4 md:static md:h-auto md:w-64 md:translate-x-0 bg-sidebar-gradient transition ease-in-out">
        <Sidebar />
      </Box>
      <Box as="main" className="flex-grow p-6 md:p-12 overflow-y-auto">
        {children}
      </Box>
    </Box>
  );
}