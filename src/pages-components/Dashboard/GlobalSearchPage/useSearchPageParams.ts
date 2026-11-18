import { useRouter } from 'next/router';

import { isSearchCategoryKey, type SearchCategoryKey } from '@/components/GlobalSearch';

// URL: /dashboard/search?query=marko&type=clients&page=2 (page is 1-based; no type = „Sve”)
export function useSearchPageParams() {
  const router = useRouter();

  const query = typeof router.query.query === 'string' ? router.query.query.trim() : '';
  const type = isSearchCategoryKey(router.query.type) ? router.query.type : undefined;
  const page = Math.max(1, Math.floor(Number(router.query.page)) || 1);

  function push(params: typeof router.query) {
    void router.push({ pathname: router.pathname, query: params }, undefined, { shallow: true });
  }

  function setPage(next: number) {
    const { page: _currentPage, ...params } = router.query;
    if (next > 1) params.page = String(next);
    push(params);
  }

  function setType(next: SearchCategoryKey | undefined) {
    const { page: _page, type: _type, ...params } = router.query;
    if (next) params.type = next;
    push(params);
  }

  return { query, type, page, isReady: router.isReady, setPage, setType };
}
