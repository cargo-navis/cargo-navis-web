'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';

import { NavLink } from './data'

export const NavItem = ({ navLink }: {navLink : NavLink})=> {
  const pathname = usePathname();
  const LinkIcon = navLink.icon;

  return (
    <Link
      key={navLink.name}
      href={navLink.href}
      className={clsx(
        'flex h-[48px] items-center justify-start gap-2 rounded-[6px] p-3 text-sm font-medium hover:bg-purple-50 hover:text-purple-950 md:flex-none md:p-2 md:px-3',
        {
          'bg-purple-50 text-purple-800': pathname === navLink.href,
        },
      )}
    >
      <LinkIcon className="w-6" />
      <p>{navLink.name}</p>
    </Link>
  );
}