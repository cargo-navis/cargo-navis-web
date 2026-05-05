import Link from 'next/link';
import { useMemo } from 'react';

import { AppMenu } from '@/components/AppMenu';
import { PositionEnum } from '@/lib/api/employees.d';
import { useCurrentTenant, useCurrentUser } from '@/lib/hooks';
import { clearAuthCookies, clearServiceWorkerOnLogout } from '@/lib/utils/session';
import { Box, Divider, FlexLayout, Heading, Icon2, LoadingSpinner, Text } from '@/ui';

import { links, NavLink } from './data';
import { NavItem } from './NavItem';

function canAccessLink(link: NavLink, userPositions: PositionEnum[] | undefined): boolean {
  // If no restrictions, everyone can access
  if (!link.allowedPositions || link.allowedPositions.length === 0) {
    return true;
  }
  // If user has no positions, deny access to restricted links
  if (!userPositions || userPositions.length === 0) {
    return false;
  }
  // Check if user has at least one allowed position
  return link.allowedPositions.some((pos) => userPositions.includes(pos));
}

export function Sidebar() {
  const { data: user } = useCurrentUser();

  const filteredLinks = useMemo(() => {
    return links.filter((link) => canAccessLink(link, user?.positions));
  }, [user?.positions]);

  async function handleLogout() {
    const answer = confirm('Želite se odjaviti?');
    if (!answer) return;

    // Clear service worker and push subscriptions
    await clearServiceWorkerOnLogout();

    clearAuthCookies();
    window.location.pathname = '/login';
  }

  return (
    <FlexLayout className="flex-col gap-[40px] flex-grow">
      <FlexLayout className="flex-col gap-4">
        <Heading as="h1" className="text-center" variant="text-xl">
          CargoNavis
        </Heading>
        <TenantLink />
      </FlexLayout>
      <FlexLayout className="items-center gap-4">
        <Box className="grow">
          <Divider bgColor="bg-teal-900" />
        </Box>
        <AppMenu />
      </FlexLayout>
      <FlexLayout as="nav" className="flex-col flex-grow gap-2">
        {filteredLinks.map((l) => (
          <NavItem key={l.name} navLink={l} />
        ))}
      </FlexLayout>
      <FlexLayout className="flex-col gap-2">
        <NavItem navLink={{ name: 'Postavke', href: '/dashboard/settings', icon: 'IconSettings' }} />
        <FlexLayout
          className="group cursor-pointer h-[48px] rounded-s p-3 text-sm font-medium hover:bg-light-50 hover:text-teal-900 md:flex-none md:p-2 md:px-3"
          onClick={handleLogout}
        >
          <FlexLayout className="items-center justify-start gap-2 group-focus:translate-x-[4px] group-hover:translate-x-[4px] transition-transform">
            <Icon2 icon="IconLogout2" size="l" />
            <Text>Odjava</Text>
          </FlexLayout>
        </FlexLayout>
      </FlexLayout>
    </FlexLayout>
  );
}

const TenantLink = () => {
  const { data } = useCurrentTenant();

  return (
    <Link href="/dashboard/tenant">
      <FlexLayout className="items-center justify-center gap-3 bg-teal-600 dark:bg-teal-900 text-light-50 dark:text-light-100 py-1 -mx-4 min-h-[40px] text-center opacity-75 hover:opacity-100 transition-opacity">
        {data ? (
          <>
            <Text variant="text-m-medium">{data.name}</Text>
            <Icon2 icon="IconSettings" size="m" />
          </>
        ) : (
          <LoadingSpinner />
        )}
      </FlexLayout>
    </Link>
  );
};
