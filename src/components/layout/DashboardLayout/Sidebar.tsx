import { AlertMenu } from '@/components/AlertMenu';
import { clearAuthCookies } from '@/lib/utils/session';
import { Box, Divider, FlexLayout, Heading, Icon, Text } from '@/ui';
import { NavItem } from './NavItem';
import { links } from './data';

export function Sidebar() {
  function handleSignOut() {
    const answer = confirm('Are you sure you want to sign out?');
    if (!answer) return;

    clearAuthCookies();
    window.location.pathname = '/login';
  }

  return (
    <FlexLayout className="flex-col gap-[40px] flex-grow">
      <Heading as="h1" variant="text-xl" className="text-center">
        CargoNavis
      </Heading>
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
          <Text>Sign Out</Text>
        </FlexLayout>
      </FlexLayout>
    </FlexLayout>
  );
}
