import type { ComponentProps } from 'react';

import { STOP_KIND, type StopKind } from '@/components/shared/stop-kind';
import type { Drawer } from '@/components/ui/drawer';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { cn } from '@/lib/utils';
import { Icon, type IconType } from '@/ui';

/**
 * Look of the driver portal (KAN-55, lab /driver): utovar orange, istovar teal (the `--utovar` / `--istovar` tokens),
 * done = green. On the petrol card of the next stop the kinds take the lightest shades, the only ones that stay
 * readable there.
 */
export const KIND_STYLES: Record<
  StopKind,
  { label: 'UTOVAR' | 'ISTOVAR'; icon: IconType; text: string; onPrimary: string; bar: string; badge: string }
> = {
  loading: {
    label: 'UTOVAR',
    icon: STOP_KIND.loading.icon,
    text: STOP_KIND.loading.text,
    onPrimary: 'text-orange-200',
    bar: 'bg-utovar-dot',
    badge: 'border-utovar/30 bg-utovar/10 text-utovar',
  },
  unloading: {
    label: 'ISTOVAR',
    icon: STOP_KIND.unloading.icon,
    text: STOP_KIND.unloading.text,
    onPrimary: 'text-teal-100',
    bar: 'bg-istovar-dot',
    badge: 'border-istovar/30 bg-istovar/10 text-istovar',
  },
};

/** „Done” text and checks: a stop's confirmation, a completed order's title. */
export const COMPLETED_TEXT = 'text-success';

/** A completed stop or order: barely tinted green, so history reads as done without standing out. */
export const COMPLETED_CARD = 'bg-success-soft shadow-sm ring-0';

// Sora 700 is wide: a long name would lose most of its letters to the ellipsis on a phone, so it falls back to Geist
// 700 (DECISIONS §5 „Driver portal”). About what fits next to the flag and the date column at 375px.
const LONG_NAME_LENGTH = 16;

/** Big bold card heading: Sora, or Geist for long names. */
export function cardHeadingClass(name: string) {
  return cn('font-bold tracking-tight', name.length > LONG_NAME_LENGTH ? 'font-sans' : 'font-heading');
}

/** Small bold caps with an icon and a line to the edge: UTOVAR, DOKUMENTI, DISPONENT. */
export const SectionTitle: React.FC<{ icon: IconType; className?: string; children: React.ReactNode }> = ({
  icon,
  className,
  children,
}) => (
  <div className={cn('flex items-center gap-2 text-[11px] font-bold', className)}>
    <Icon icon={icon} size="s" />
    <span className="min-w-0 truncate">{children}</span>
    <div className="h-px min-w-3 grow bg-current opacity-30" />
  </div>
);

/** Empty / status state, a size up from the dashboard's (DECISIONS §3 Empty): 48px tile, 18px title, xl button. */
export const DriverEmpty: React.FC<{
  icon: IconType;
  variant?: 'icon' | 'danger';
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ icon, variant = 'icon', title, description, action, className }) => (
  <Empty className={cn('min-h-0 border-0 px-8 py-16', className)}>
    <EmptyHeader>
      <EmptyMedia className="size-12 rounded-xl" variant={variant}>
        <Icon icon={icon} size="l" />
      </EmptyMedia>
      <EmptyTitle className="text-lg">{title}</EmptyTitle>
      {description && <EmptyDescription>{description}</EmptyDescription>}
    </EmptyHeader>
    {action && <EmptyContent>{action}</EmptyContent>}
  </Empty>
);

type DrawerOpenChange = NonNullable<ComponentProps<typeof Drawer>['onOpenChange']>;

/**
 * Toasts render in their own portal, outside the drawer. Tapping a toast or its action (e.g. „Poništi”) would
 * otherwise count as an outside press and close the drawer.
 */
export function keepOpenOnToastPress(onOpenChange: (open: boolean) => void): DrawerOpenChange {
  return (open, details) => {
    const target = details.event?.target as Element | null | undefined;
    if (!open && details.reason === 'outside-press' && target?.closest?.('[data-slot="toast-viewport"]')) {
      details.cancel();
      return;
    }
    onOpenChange(open);
  };
}
