import Link from 'next/link';

import { AppMenu } from '@/components/AppMenu';
import { useCurrentTenant } from '@/lib/hooks';
import { clearAuthCookies, clearServiceWorkerOnSignout } from '@/lib/utils/session';
import { Box, Divider, FlexLayout, Heading, Icon, Text } from '@/ui';

import { links } from './data';
import { NavItem } from './NavItem';

export function Sidebar() {
  async function handleLogout() {
    const answer = confirm('Želite se odjaviti?');
    if (!answer) return;

    // Clear service worker and push subscriptions
    await clearServiceWorkerOnSignout();

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
        {links.map((l) => (
          <NavItem key={l.name} navLink={l} />
        ))}
      </FlexLayout>
      <FlexLayout className="flex-col gap-2">
        <NavItem navLink={{ name: 'Postavke', href: '/dashboard/settings', icon: 'Cog6ToothIcon' }} />
        <FlexLayout
          className="group cursor-pointer h-[48px] rounded-s p-3 text-sm font-medium hover:bg-light-50 hover:text-teal-900 md:flex-none md:p-2 md:px-3"
          onClick={handleLogout}
        >
          <FlexLayout className="items-center justify-start gap-2 group-focus:translate-x-[4px] group-hover:translate-x-[4px] transition-transform">
            <Icon icon="ArrowLeftStartOnRectangleIcon" size="l" />
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
      <Box className="bg-teal-600 dark:bg-teal-900 py-1 -mx-4 min-h-[40px] text-center opacity-75 hover:opacity-100 transition-opacity">
        <Text className="text-light-50 dark:text-light-100" variant="text-m-medium">
          {data ? data.name : 'Loading...'}
        </Text>
      </Box>
    </Link>
  );
};
