'use client';

import { links } from '@/components/layout/DashboardLayout/data';
import { Box, Heading, Icon, Text } from '@/ui';
import { NavItem } from './NavItem';

export function Sidebar() {
  return (
    <Box className="flex flex-col gap-[40px] flex-grow">
      <Heading as="h1" variant="text-xl" className="text-center">
        CargoNavis
      </Heading>
      <Box as="nav" className="flex flex-col flex-grow gap-2">
        {links.map((l) => (
          <NavItem key={l.name} navLink={l} />
        ))}
      </Box>
      <Box className="group cursor-pointer h-[48px] flex rounded-s p-3 text-sm font-medium hover:bg-light-50 hover:text-teal-900 md:flex-none md:p-2 md:px-3">
        <Box className="flex items-center justify-start gap-2 group-focus:translate-x-[4px] group-hover:translate-x-[4px] transition-transform">
          <Icon icon="ArrowLeftStartOnRectangleIcon" size="l" />
          <Text>Sign Out</Text>
        </Box>
      </Box>
    </Box>
  );
}
