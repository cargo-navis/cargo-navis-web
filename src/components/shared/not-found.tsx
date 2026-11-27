import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Icon } from '@/ui';

import { displayPath, ENTITY_NOT_FOUND, type EntityKind, PAGE_NOT_FOUND } from './not-found-copy';

export { type EntityKind, isNotFoundError } from './not-found-copy';

/**
 * Inside DashboardLayout's content: `data-not-found` makes the content area a column (DashboardLayout), so the block
 * fills it and sits in the middle of the card, not at the top.
 */
const FILL = { 'data-not-found': '', className: 'flex-1 p-0' } as const;

/**
 * D „Kontekstualno” (lab /lab-404): the entity page knows what was missing; say it, show the path, offer the list and
 * a new one. Render it as a direct child of DashboardLayout, in place of the page's content; only for a real 404 /
 * missing entity (load errors keep their „Pokušaj ponovno” state).
 */
export function EntityNotFound({ kind }: { kind: EntityKind }) {
  const { asPath } = useRouter();
  const copy = ENTITY_NOT_FOUND[kind];

  return (
    <Empty {...FILL}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon icon={copy.icon} size="m" />
        </EmptyMedia>
        <EmptyTitle>{copy.title}</EmptyTitle>
        <EmptyDescription>{copy.description}</EmptyDescription>
        <code className="max-w-full truncate rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
          {displayPath(asPath)}
        </code>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button nativeButton={false} render={<Link href={copy.list.href} />}>
            {copy.list.label}
          </Button>
          <Button nativeButton={false} render={<Link href={copy.create.href} />} variant="outline">
            <Icon data-icon="inline-start" icon="IconPlus" size="s" /> {copy.create.label}
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}

/**
 * „Natrag”: the previous page, or a full load of `fallback` when this tab opened on the bad link (nothing to go back
 * to; a full load because `/` is only a middleware redirect).
 */
export function useGoBack(fallback: string) {
  const router = useRouter();
  return React.useCallback(() => {
    if (window.history.length > 1) router.back();
    else window.location.assign(fallback);
  }, [router, fallback]);
}

/** A „Mirno” (lab /lab-404): an unknown /dashboard path, inside DashboardLayout (pages/404). */
export function PageNotFound() {
  const goBack = useGoBack(PAGE_NOT_FOUND.home.href);

  return (
    <Empty {...FILL}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon icon={PAGE_NOT_FOUND.icon} size="m" />
        </EmptyMedia>
        <EmptyTitle>{PAGE_NOT_FOUND.title}</EmptyTitle>
        <EmptyDescription>{PAGE_NOT_FOUND.description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button nativeButton={false} render={<Link href={PAGE_NOT_FOUND.home.href} />}>
            <Icon data-icon="inline-start" icon="IconHome" size="s" /> {PAGE_NOT_FOUND.home.label}
          </Button>
          <Button variant="outline" onClick={goBack}>
            <Icon data-icon="inline-start" icon="IconArrowLeft" size="s" /> {PAGE_NOT_FOUND.back}
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
