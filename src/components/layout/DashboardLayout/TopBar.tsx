import Link from 'next/link';
import { Fragment } from 'react';

import { AppMenu } from '@/components/AppMenu';
import { GlobalSearch } from '@/components/GlobalSearch';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

import type { Crumb } from './breadcrumbs';

/** 56px bar on top of the content card: sidebar toggle, breadcrumb, ⌘K field, bell (lab /dashboard top-bar.tsx). */
export function TopBar({ breadcrumbs }: { breadcrumbs: Crumb[] }) {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:rounded-t-xl">
      <SidebarTrigger />
      <Separator className="h-5" orientation="vertical" />
      {breadcrumbs.length > 0 && (
        <Breadcrumb className="hidden min-w-0 md:block">
          <BreadcrumbList className="flex-nowrap">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <Fragment key={`${index}-${crumb.label}`}>
                  <BreadcrumbItem className="min-w-0">
                    {isLast ? (
                      <BreadcrumbPage className="truncate">{crumb.label}</BreadcrumbPage>
                    ) : crumb.href ? (
                      <BreadcrumbLink className="truncate" render={<Link href={crumb.href} />}>
                        {crumb.label}
                      </BreadcrumbLink>
                    ) : (
                      <span className="truncate">{crumb.label}</span>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      )}
      <div className="flex min-w-0 flex-1 justify-center">
        <GlobalSearch />
      </div>
      <div className="flex items-center gap-1">
        <AppMenu />
      </div>
    </header>
  );
}
