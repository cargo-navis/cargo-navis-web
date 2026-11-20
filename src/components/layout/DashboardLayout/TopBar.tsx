import { useOs } from '@mantine/hooks';
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
import { Kbd } from '@/components/ui/kbd';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import type { Crumb } from './breadcrumbs';

/** 56px bar on top of the content card: sidebar toggle, breadcrumb, ⌘K field, bell (lab /dashboard top-bar.tsx). */
export function TopBar({ breadcrumbs }: { breadcrumbs: Crumb[] }) {
  const os = useOs();
  const { open, isMobile } = useSidebar();
  // ⌘B / Ctrl B is the sidebar's own shortcut (components/ui/sidebar.tsx); the tooltip makes it findable.
  const shortcut = os === 'macos' || os === 'ios' ? '⌘B' : 'Ctrl B';
  const label = isMobile ? 'Otvori navigaciju' : open ? 'Sakrij navigaciju' : 'Prikaži navigaciju';

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:rounded-t-xl">
      <Tooltip>
        <TooltipTrigger render={<SidebarTrigger />} />
        <TooltipContent className="flex items-center gap-2" side="bottom">
          {label}
          {!isMobile && <Kbd>{shortcut}</Kbd>}
        </TooltipContent>
      </Tooltip>
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
