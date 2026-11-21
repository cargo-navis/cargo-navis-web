import { useRouter } from 'next/router';
import * as React from 'react';

import { FRAME_CLASS, FRAME_STYLE } from '@/components/layout/frame';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { useDashboardAnalytics } from '@/lib/analytics/useDashboardAnalytics';
import { usePushNotificationSubscription } from '@/lib/hooks';
import { cn } from '@/lib/utils';

import { AppSidebar } from './AppSidebar';
import { type Crumb, getRouteBreadcrumbs } from './breadcrumbs';
import { TopBar } from './TopBar';
import { useSidebarOpen } from './useSidebarOpen';

/** Height of the sticky top bar; pinned table headers sit under it (`top-(--app-header-height,0px)`). */
const APP_HEADER_HEIGHT = '3.5rem';

// Frame behind the sidebar and around the content card (layout/frame.ts) + the header height for pinned headers.
const SHELL_STYLE = { ...FRAME_STYLE, '--app-header-height': APP_HEADER_HEIGHT } as React.CSSProperties;

export interface DashboardLayoutProps {
  children: React.ReactNode;
  /**
   * Trail in the top bar; the last crumb is the current page. Defaults to the route's trail (breadcrumbs.ts), so pass
   * it only to show names, e.g. `[CRUMBS.shipments, { label: shipment.orderNumber }]`.
   */
  breadcrumbs?: Crumb[];
  /** Classes for the content area (default padding `p-5 md:p-7`). */
  contentClassName?: string;
}

/**
 * The dashboard shell (DECISIONS §4, lab /dashboard): inset sidebar collapsible to icons, sticky top bar with
 * breadcrumb, ⌘K and the bell, page content in a rounded card on the frame. Every dashboard page wraps itself in it.
 */
export const DashboardLayout = ({ children, breadcrumbs, contentClassName }: DashboardLayoutProps) => {
  usePushNotificationSubscription();
  useDashboardAnalytics();
  const { pathname } = useRouter();
  const [open, setOpen] = useSidebarOpen();

  // Also on <html> for code that reads it with getComputedStyle(document.documentElement).
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--app-header-height', APP_HEADER_HEIGHT);
    return () => {
      root.style.removeProperty('--app-header-height');
    };
  }, []);

  return (
    <SidebarProvider className={FRAME_CLASS} open={open} style={SHELL_STYLE} onOpenChange={setOpen}>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <TopBar breadcrumbs={breadcrumbs ?? getRouteBreadcrumbs(pathname)} />
        {/* A not-found block (components/shared/not-found) fills the card and sits in its middle. */}
        <div
          className={cn(
            'flex-1 p-5 md:p-7 has-[>[data-not-found]]:flex has-[>[data-not-found]]:flex-col',
            contentClassName
          )}
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
