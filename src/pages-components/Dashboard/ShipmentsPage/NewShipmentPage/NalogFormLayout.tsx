import Link from 'next/link';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import { Icon, type IconType } from '@/ui';

import type { NalogValues } from './values';

/** Back link + Sora title (lab /nalog-form header). */
export function NalogFormHeader({
  backHref,
  backLabel,
  title,
  description,
}: {
  backHref: string;
  backLabel: string;
  title: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-2">
      <Link
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        href={backHref}
      >
        <Icon icon="IconArrowLeft" size="s" /> {backLabel}
      </Link>
      <h1 className="font-heading text-3xl font-bold tracking-tight">{title}</h1>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </header>
  );
}

/** First load: the form's shape (left card, two tereta cards). */
export function NalogFormSkeleton() {
  return (
    <div aria-busy className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-9 w-56" />
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[440px_minmax(0,1fr)]">
        <div className="flex flex-col gap-4 rounded-xl border p-5">
          <Skeleton className="h-6 w-24" />
          {Array.from({ length: 5 }, (_, index) => (
            <div className="flex flex-col gap-2" key={index}>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/** Something to say instead of the form (not found, not ready, failed to load). */
export function NalogFormProblem({
  icon = 'IconFileAlert',
  danger,
  title,
  description,
  backHref,
  backLabel,
  onRetry,
}: {
  icon?: IconType;
  danger?: boolean;
  title: string;
  description?: React.ReactNode;
  backHref: string;
  backLabel: string;
  onRetry?(): void;
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant={danger ? 'danger' : 'icon'}>
          <Icon icon={icon} size="m" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        {description && <EmptyDescription>{description}</EmptyDescription>}
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center">
        <Button nativeButton={false} render={<Link href={backHref} />} variant="outline">
          <Icon data-icon="inline-start" icon="IconArrowLeft" size="s" /> {backLabel}
        </Button>
        {onRetry && (
          <Button variant="outline" onClick={onRetry}>
            <Icon data-icon="inline-start" icon="IconRefresh" size="s" /> Pokušaj ponovno
          </Button>
        )}
      </EmptyContent>
    </Empty>
  );
}

/**
 * The form's starting values, built once the data is there (postal code labels may need a request). Frozen after
 * that: a background refetch must not reset what is being typed. A new `key` (another URL, e.g. /new?copyFromId=… →
 * /new) starts again.
 */
export function useInitialValues(load: (() => Promise<NalogValues>) | null, key: string) {
  const [state, setState] = React.useState<{ key: string; values: NalogValues | null; failed: boolean }>({
    key,
    values: null,
    failed: false,
  });
  const current = state.key === key ? state : { key, values: null, failed: false };
  const loadRef = React.useRef(load);
  loadRef.current = load;
  const ready = !!load;
  const loaded = !!current.values;

  React.useEffect(() => {
    if (!ready || loaded) return;
    let cancelled = false;
    loadRef.current?.().then(
      (values) => !cancelled && setState({ key, values, failed: false }),
      (error) => {
        console.error(error);
        if (!cancelled) setState({ key, values: null, failed: true });
      }
    );
    return () => {
      cancelled = true;
    };
  }, [ready, loaded, key]);

  return { values: current.values, failed: current.failed };
}
