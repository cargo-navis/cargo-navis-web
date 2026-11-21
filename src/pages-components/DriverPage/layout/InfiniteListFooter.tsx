import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Icon } from '@/ui';

/** The paging part of an infinite query result; the query result itself can be passed. */
export interface InfinitePagination {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  isFetchNextPageError: boolean;
  fetchNextPage(): unknown;
}

// Start loading while the end of the list is still about a screen away, so scrolling rarely has to wait.
const PRELOAD_MARGIN = '600px 0px';

/**
 * End of an infinite list: loads the next page as it nears the screen, shows a spinner while it loads and a retry
 * when it failed (a failed page isn't retried on its own, so a lost connection doesn't loop).
 */
export const InfiniteListFooter: React.FC<{ pagination: InfinitePagination }> = ({ pagination }) => {
  const { hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } = pagination;
  const sentinelRef = useRef<HTMLDivElement>(null);
  const canLoad = hasNextPage && !isFetchingNextPage && !isFetchNextPageError;

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !canLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fetchNextPage();
      },
      { rootMargin: PRELOAD_MARGIN }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [canLoad, fetchNextPage]);

  return (
    <>
      <div ref={sentinelRef} />
      {isFetchingNextPage && (
        <div className="flex justify-center py-4 text-muted-foreground">
          <Spinner className="size-5" />
        </div>
      )}
      {isFetchNextPageError && !isFetchingNextPage && (
        <div className="flex flex-col items-center gap-3 py-4">
          <span className="text-sm text-muted-foreground">Učitavanje nije uspjelo.</span>
          <Button size="xl" variant="outline" onClick={() => fetchNextPage()}>
            <Icon data-icon="inline-start" icon="IconReload" size="m" />
            Pokušaj ponovno
          </Button>
        </div>
      )}
    </>
  );
};
