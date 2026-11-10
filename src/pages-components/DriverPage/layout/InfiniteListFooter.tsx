import { useEffect, useRef } from 'react';

import { Box, Button, FlexLayout, LoadingSpinner, Text } from '@/ui';

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
      <Box ref={sentinelRef} />
      {isFetchingNextPage && (
        <FlexLayout className="justify-center py-4">
          <LoadingSpinner size="s" />
        </FlexLayout>
      )}
      {isFetchNextPageError && !isFetchingNextPage && (
        <FlexLayout className="flex-col items-center gap-2 py-4">
          <Text color="text-color-3" variant="text-xs">
            Učitavanje nije uspjelo.
          </Text>
          <Button size="m" text="Pokušaj ponovno" variant="secondary" onClick={() => fetchNextPage()} />
        </FlexLayout>
      )}
    </>
  );
};
