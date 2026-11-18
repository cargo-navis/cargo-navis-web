import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import * as React from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { logout } from '@/lib/api';
import { useCurrentTenant, useCurrentUser } from '@/lib/hooks';
import { accessTokenStore } from '@/lib/services/accessTokenStore';
import { initials } from '@/lib/utils/initials';
import { clearServiceWorkerOnLogout, unsubscribePushOnLogout } from '@/lib/utils/session';
import { Icon, type IconType } from '@/ui';

import { canAccessNavItem, NAV, POSITION_LABELS, SETTINGS_ACCOUNT_HREF, SETTINGS_COMPANY_HREF } from './nav';

/**
 * Light: the sidebar is transparent on the petrol 6 % frame (SidebarProvider in DashboardLayout), active item white
 * with petrol text and icon. Dark: transparent on the teal-900 frame, active item white 12 %. Lab /dashboard
 * `STYLE_PROPS.adaptive`.
 */
const SIDEBAR_CLASS =
  '[--sidebar:transparent] [--sidebar-border:var(--frame-border)] [--sidebar-accent:oklch(1_0_0/75%)] [--sidebar-accent-foreground:var(--primary)] [&_[data-active]_svg]:text-primary dark:[--sidebar:transparent] dark:[--sidebar-foreground:oklch(0.97_0_0)] dark:[--sidebar-accent:oklch(1_0_0/12%)] dark:[--sidebar-accent-foreground:oklch(1_0_0)] dark:[--sidebar-border:oklch(1_0_0/10%)] dark:[--sidebar-ring:var(--color-teal-300)] dark:[&_[data-active]_svg]:text-white';

export function AppSidebar() {
  const { pathname } = useRouter();
  const { data: user } = useCurrentUser();
  const items = React.useMemo(() => NAV.filter((item) => canAccessNavItem(item, user?.positions)), [user?.positions]);

  return (
    <Sidebar className={SIDEBAR_CLASS} collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <TenantButton isActive={pathname === SETTINGS_COMPANY_HREF} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigacija</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    isActive={item.match(pathname)}
                    render={<Link href={item.href} />}
                    tooltip={item.label}
                  >
                    <Icon icon={item.icon} size="s" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                  {item.action && (
                    // Today „Novi Nalog” is a sub item; here a + that shows on hover.
                    <SidebarMenuAction
                      aria-label={item.action.label}
                      render={<Link href={item.action.href} title={item.action.label} />}
                      showOnHover
                    >
                      <Icon icon="IconPlus" size="s" />
                    </SidebarMenuAction>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <UserMenu />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

/** Brand + company. One company per user (no switcher): click = Postavke › Tvrtka. */
function TenantButton({ isActive }: { isActive: boolean }) {
  const { data: tenant } = useCurrentTenant();

  return (
    <SidebarMenuButton
      isActive={isActive}
      render={<Link href={SETTINGS_COMPANY_HREF} />}
      size="lg"
      tooltip={tenant ? `${tenant.name} · Podaci tvrtke` : 'Podaci tvrtke'}
    >
      <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-white">
        <img alt="" className="size-6" src="/logomark.png" />
      </div>
      <div className="grid flex-1 text-left leading-tight">
        <span className="truncate font-heading text-base font-bold tracking-tight">CargoNavis</span>
        {tenant ? (
          <span className="truncate text-xs opacity-70" title={tenant.name}>
            {tenant.name}
          </span>
        ) : (
          <Skeleton className="mt-1 h-3 w-28" />
        )}
      </div>
    </SidebarMenuButton>
  );
}

async function handleLogout() {
  await unsubscribePushOnLogout();
  await clearServiceWorkerOnLogout();
  // The refresh cookie is httpOnly, so only the server can clear it; log out locally even if this fails.
  await logout().catch(() => undefined);

  accessTokenStore.clear();
  window.location.pathname = '/login';
}

/** Footer: who is signed in; menu = email, Moj račun, Izgled, Odjava (no confirm: logging out is cheap, DECISIONS §2). */
function UserMenu() {
  const { data: user } = useCurrentUser();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  if (!user) return <SidebarMenuSkeleton className="h-12" showIcon />;

  const name = user.fullName || `${user.firstName} ${user.lastName}`;
  const role = user.positions.map((position) => POSITION_LABELS[position]).join(', ');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<SidebarMenuButton className="data-popup-open:bg-sidebar-accent" size="lg" />}>
        <Avatar className="size-8 rounded-lg after:rounded-lg">
          <AvatarFallback className="rounded-lg bg-teal-100 text-teal-800">{initials(name)}</AvatarFallback>
        </Avatar>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-medium">{name}</span>
          {role && <span className="truncate text-xs opacity-70">{role}</span>}
        </div>
        <Icon className="ml-auto" icon="IconSelector" size="s" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60" side="right">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="truncate">{user.email}</DropdownMenuLabel>
          <DropdownMenuItem render={<Link href={SETTINGS_ACCOUNT_HREF} />}>
            <Icon icon="IconUser" size="s" /> Moj račun
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <ThemePicker />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          closeOnClick={false}
          disabled={isLoggingOut}
          variant="destructive"
          onClick={() => {
            setIsLoggingOut(true);
            void handleLogout();
          }}
        >
          <Icon icon="IconLogout2" size="s" /> Odjava
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const THEMES: { value: 'system' | 'light' | 'dark'; label: string; icon: IconType }[] = [
  { value: 'system', label: 'Sustav', icon: 'IconDeviceDesktop' },
  { value: 'light', label: 'Svijetla', icon: 'IconSun' },
  { value: 'dark', label: 'Tamna', icon: 'IconMoon' },
];

/**
 * Izgled, one click from the user menu: a segmented row of radio items (arrow keys reach them like any menu item; the
 * menu stays open so the change is visible). Per browser (next-themes → localStorage), no backend.
 */
function ThemePicker() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex items-center justify-between gap-2 py-1 pr-1 pl-1.5">
      <span className="text-sm">Izgled</span>
      <DropdownMenuRadioGroup
        className="flex gap-0.5 rounded-lg bg-muted p-0.5"
        value={theme ?? 'system'}
        onValueChange={(value) => setTheme(value as string)}
      >
        {THEMES.map(({ value, label, icon }) => (
          <DropdownMenuRadioItem
            aria-label={label}
            className="size-7 justify-center rounded-md p-0 pr-0 pointer-coarse:min-h-0 data-checked:bg-background data-checked:shadow-xs [&>[data-slot=dropdown-menu-radio-item-indicator]]:hidden"
            closeOnClick={false}
            key={value}
            title={label}
            value={value}
          >
            <Icon icon={icon} size="s" />
          </DropdownMenuRadioItem>
        ))}
      </DropdownMenuRadioGroup>
    </div>
  );
}
