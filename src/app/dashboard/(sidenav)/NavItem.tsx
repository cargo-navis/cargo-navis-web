import Link from 'next/link';
import clsx from 'clsx';

import { Box, Text } from '@/ui';
import { Icon } from '@/ui/components/Icon';

import { NavLink } from './data'
import { useRouter } from 'next/router';

export const NavItem = ({ navLink }: {navLink : NavLink})=> {
  const { pathname } = useRouter();

  return (
    <Link
      key={navLink.name}
      href={navLink.href}
      className={clsx(
        'flex group h-[48px] rounded-s p-3 text-sm font-medium hover:bg-light-50 hover:text-teal-900 md:flex-none md:p-2 md:px-3',
        {
          'bg-light-50 text-teal-900': navLink.href !== '/dashboard' && pathname.startsWith(navLink.href) || navLink.href === pathname,
        },
      )}
    >
      <Box className="group-focus:translate-x-[4px] group-hover:translate-x-[4px] transition-transform flex items-center justify-start gap-2">
        <Icon icon={navLink.icon} size="l" />
        <Text>{navLink.name}</Text>
      </Box>
    </Link>
  );
}