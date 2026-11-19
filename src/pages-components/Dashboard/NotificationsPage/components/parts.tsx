import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { Icon, type IconType } from '@/ui';

/** One card of the list: a small uppercase header („FAKTURE · 312”, „DANAS”) + an optional action, then the rows. */
export function ListSection({
  title,
  action,
  children,
}: {
  title: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border bg-card">
      <div className="flex min-h-10 items-center justify-between gap-2 border-b bg-muted/40 px-4 py-1.5">
        <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{title}</h3>
        {action}
      </div>
      <div className="divide-y">{children}</div>
    </section>
  );
}

/** Shared row look: full-width link / button / block with a hover tint. */
export const ROW = 'flex w-full items-start gap-3 px-4 py-3 text-left';
export const ROW_INTERACTIVE = 'outline-none hover:bg-muted/50 focus-visible:bg-muted/50';

export function ListEmpty({
  icon,
  variant = 'icon',
  title,
  description,
}: {
  icon: IconType;
  variant?: 'icon' | 'success';
  title: string;
  description?: string;
}) {
  return (
    <Empty className="min-h-48 border border-solid bg-card">
      <EmptyHeader>
        <EmptyMedia variant={variant}>
          <Icon icon={icon} size="m" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
    </Empty>
  );
}

/** Load error in place of the list, with „Pokušaj ponovno” (DECISIONS §2 Empty states). */
export function ListError({ title, onRetry }: { title: string; onRetry(): void }) {
  return (
    <Empty className="min-h-48 border border-solid bg-card">
      <EmptyHeader>
        <EmptyMedia variant="danger">
          <Icon icon="IconAlertTriangle" size="m" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>Provjeri vezu i pokušaj ponovno.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={onRetry}>
          <Icon data-icon="inline-start" icon="IconRefresh" size="s" /> Pokušaj ponovno
        </Button>
      </EmptyContent>
    </Empty>
  );
}

/** First load: two cards of placeholder rows (`avatar` = round 28px lead instead of a 16px icon). */
export function ListSkeleton({ avatar = false }: { avatar?: boolean }) {
  return (
    <div aria-busy className="flex flex-col gap-4">
      {[4, 3].map((rows, group) => (
        <section className="overflow-hidden rounded-xl border bg-card" key={group}>
          <div className="flex min-h-10 items-center border-b bg-muted/40 px-4 py-1.5">
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="divide-y">
            {Array.from({ length: rows }, (_, index) => (
              <div className={ROW} key={index}>
                <Skeleton className={avatar ? 'size-7 rounded-full' : 'size-4'} />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
