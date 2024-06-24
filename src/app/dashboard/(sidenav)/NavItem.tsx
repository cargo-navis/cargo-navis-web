'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';

import { NavLink } from './data'
import { Box, Text } from '@/ui';

export const NavItem = ({ navLink }: {navLink : NavLink})=> {
  const pathname = usePathname();
  const LinkIcon = navLink.icon;

  return (
    <Link
      key={navLink.name}
      href={navLink.href}
      className={clsx(
        'flex group h-[48px] rounded-s p-3 text-sm font-medium hover:bg-light-50 hover:text-teal-900 md:flex-none md:p-2 md:px-3',
        {
          'bg-light-50 text-teal-900': pathname === navLink.href,
        },
      )}
    >
      <Box className="group-focus:translate-x-[4px] group-hover:translate-x-[4px] transition-transform flex items-center justify-start gap-2">
        <LinkIcon className="w-6" />
        <Text>{navLink.name}</Text>
      </Box>
    </Link>
  );
}