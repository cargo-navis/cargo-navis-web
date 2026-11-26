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
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { resetAnalytics } from '@/lib/analytics';
import { logout } from '@/lib/api';
import { useCurrentTenant, useCurrentUser } from '@/lib/hooks';
import { accessTokenStore } from '@/lib/services/accessTokenStore';
import { initials } from '@/lib/utils/initials';
import { clearServiceWorkerOnLogout, unsubscribePushOnLogout } from '@/lib/utils/session';
import { ACCEPTED_DRAFT_FILE_TYPES, useUploadDraftFiles } from '@/pages-components/Dashboard/ShipmentsPage/hooks';
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
  const router = useRouter();
  const { pathname } = router;
  const { data: user } = useCurrentUser();
  const items = React.useMemo(() => NAV.filter((item) => canAccessNavItem(item, user?.positions)), [user?.positions]);
  // „Učitaj nalog”: same upload as the Nalozi page header, then the Nalozi u pripremi tab.
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const uploadFiles = useUploadDraftFiles(() => void router.push('/dashboard/shipments?tab=drafts'), 'sidebar');
  const openFilePicker = () => fileInputRef.current?.click();

  return (
    <>
      {/* Outside the Sidebar: on phones it is a sheet that unmounts its content when it closes. */}
      <input
        accept={ACCEPTED_DRAFT_FILE_TYPES.join(',')}
        className="hidden"
        multiple
        ref={fileInputRef}
        type="file"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.target.value = '';
          if (files.length > 0) void uploadFiles(files);
        }}
      />
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
                {items.map((item) => {
                  const actions = item.actions ?? [];
                  const isActionPage = actions.some((action) => 'href' in action && action.href === pathname);
                  return (
                    <React.Fragment key={item.key}>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          // On „Novi nalog” only its sub-item is active, not Nalozi too.
                          isActive={item.match(pathname) && !isActionPage}
                          render={<Link href={item.href} />}
                          tooltip={item.label}
                        >
                          <Icon icon={item.icon} size="s" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                        {actions.length > 0 && (
                          // „+ Novi nalog” / „Učitaj nalog” always visible under their item (decided 2026-11-20, lab
                          // /dashboard option C; replaces the hover +). Sub menus hide in the collapsed sidebar — the icon
                          // items below take over.
                          <SidebarMenuSub>
                            {actions.map((action) => (
                              <SidebarMenuSubItem key={action.label}>
                                <SidebarMenuSubButton
                                  isActive={'href' in action && pathname === action.href}
                                  render={'href' in action ? <Link href={action.href} /> : <button type="button" />}
                                  onClick={'upload' in action ? openFilePicker : undefined}
                                >
                                  <Icon icon={action.icon} size="s" />
                                  <span>{action.label}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        )}
                      </SidebarMenuItem>
                      {actions.map((action) => (
                        // Collapsed sidebar only: the action icons right under the item's icon, tooltip with the label.
                        <SidebarMenuItem className="hidden group-data-[collapsible=icon]:block" key={action.label}>
                          <SidebarMenuButton
                            isActive={'href' in action && pathname === action.href}
                            render={'href' in action ? <Link href={action.href} /> : undefined}
                            tooltip={action.label}
                            onClick={'upload' in action ? openFilePicker : undefined}
                          >
                            <Icon icon={action.icon} size="s" />
                            <span>{action.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </React.Fragment>
                  );
                })}
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
    </>
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
        <span className="truncate font-heading text-base font-bold tracking-tight">Cargo Navis</span>
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
  resetAnalytics();
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
          <AvatarFallback className="rounded-lg bg-brand-soft text-brand">{initials(name)}</AvatarFallback>
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
