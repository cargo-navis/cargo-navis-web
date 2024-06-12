'use client';
import { ArrowLeftStartOnRectangleIcon } from '@heroicons/react/24/outline';

import { NavItem } from './NavItem';
import { links } from './data';


export function Sidebar() {
  return (
    <div className="flex flex-col gap-10 flex-grow">
      <h2>CARGONAVIS</h2>
      <nav className="flex flex-col flex-grow gap-2 md:gap-1">
        {links.map(l => <NavItem key={l.name} navLink={l}/>)}
      </nav>
      <div className="cursor-pointer flex h-[48px] items-center justify-start gap-2 rounded-md p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:p-2 md:px-3">
        <ArrowLeftStartOnRectangleIcon className="w-6" />
        <p>Sign Out</p>
      </div>
    </div>
  );
}