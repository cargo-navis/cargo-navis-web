'use client';
import { ArrowLeftStartOnRectangleIcon } from '@heroicons/react/24/outline';

import { NavItem } from './NavItem';
import { links } from './data';
import { Box, Heading, Text } from '@/ui';

export function Sidebar() {
  return (
    <Box className="flex flex-col gap-10 flex-grow">
      <Heading as="h1" variant="text-xl" className="text-center">CargoNavis</Heading>
      <Box as="nav" className="flex flex-col flex-grow gap-2">
        {links.map(l => <NavItem key={l.name} navLink={l}/>)}
      </Box>
      <Box className="group cursor-pointer h-[48px] flex rounded-s p-3 text-sm font-medium hover:bg-light-50 hover:text-teal-900 md:flex-none md:p-2 md:px-3">
        <Box className="flex items-center justify-start gap-2 group-focus:translate-x-[4px] group-hover:translate-x-[4px] transition-transform">
          <ArrowLeftStartOnRectangleIcon className="w-6" />
          <Text>Sign Out</Text>
        </Box>
      </Box>
    </Box>
  );
}