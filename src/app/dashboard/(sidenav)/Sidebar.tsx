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
      <Box className="cursor-pointer flex h-[48px] items-center justify-start gap-2 rounded-md p-3 text-sm font-medium hover:bg-purple-50 hover:text-purple-950 md:flex-none md:p-2 md:px-3">
        <ArrowLeftStartOnRectangleIcon className="w-6" />
        <Text>Sign Out</Text>
      </Box>
    </Box>
  );
}