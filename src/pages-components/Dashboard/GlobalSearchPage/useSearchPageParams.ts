import { useRouter } from 'next/router';

import { isSearchCategoryKey } from '@/components/GlobalSearch';

// URL: /dashboard/search?query=marko&type=clients&page=2 (page is 1-based)
export function useSearchPageParams() {
  const router = useRouter();

  const query = typeof router.query.query === 'string' ? router.query.query.trim() : '';
  const type = isSearchCategoryKey(router.query.type) ? router.query.type : undefined;
  const page = Math.max(1, Math.floor(Number(router.query.page)) || 1);

  function setPage(next: number) {
    const { page: _currentPage, ...params } = router.query;
    if (next > 1) params.page = String(next);

    void router.push({ pathname: router.pathname, query: params }, undefined, { shallow: true });
  }

  return { query, type, page, isReady: router.isReady, setPage };
}
