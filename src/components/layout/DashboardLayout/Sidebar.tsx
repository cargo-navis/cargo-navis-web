import { AlertMenu } from '@/components/AlertMenu';
import { useCurrentTenant } from '@/lib/hooks';
import { clearAuthCookies } from '@/lib/utils/session';
import { Box, Divider, FlexLayout, Heading, Icon, Text } from '@/ui';
import Link from 'next/link';
import { NavItem } from './NavItem';
import { links } from './data';

export function Sidebar() {
  function handleSignOut() {
    const answer = confirm('Želite se odjaviti?');
    if (!answer) return;

    clearAuthCookies();
    window.location.pathname = '/login';
  }

  return (
    <FlexLayout className="flex-col gap-[40px] flex-grow">
      <FlexLayout className="flex-col gap-4">
        <Heading as="h1" variant="text-xl" className="text-center">
          CargoNavis
        </Heading>
        <TenantLink />
      </FlexLayout>
      <FlexLayout className="items-center gap-4">
        <Box className="grow">
          <Divider bgColor="bg-teal-900" />
        </Box>
        <AlertMenu />
      </FlexLayout>
      <FlexLayout as="nav" className="flex-col flex-grow gap-2">
        {links.map((l) => (
          <NavItem key={l.name} navLink={l} />
        ))}
      </FlexLayout>
      <FlexLayout
        className="group cursor-pointer h-[48px] rounded-s p-3 text-sm font-medium hover:bg-light-50 hover:text-teal-900 md:flex-none md:p-2 md:px-3"
        onClick={handleSignOut}
      >
        <FlexLayout className="items-center justify-start gap-2 group-focus:translate-x-[4px] group-hover:translate-x-[4px] transition-transform">
          <Icon icon="ArrowLeftStartOnRectangleIcon" size="l" />
          <Text>Odjava</Text>
        </FlexLayout>
      </FlexLayout>
    </FlexLayout>
  );
}

const TenantLink = () => {
  const { data } = useCurrentTenant();

  return (
    <Link href="/dashboard/tenant">
      <Box className="bg-teal-900 py-1 -mx-4 min-h-[40px] text-center opacity-75 hover:opacity-100 transition-opacity">
        <Text color="text-color-2" variant="text-m-medium">
          {data ? data.name : 'Loading...'}
        </Text>
      </Box>
    </Link>
  );
};
