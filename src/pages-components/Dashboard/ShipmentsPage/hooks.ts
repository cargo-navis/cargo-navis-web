import { useRouter } from 'next/router';

interface UsePaginationQueryParamStateOptions {
  defaultPage?: number;
  defaultPageSize?: number;
}

interface PaginationState {
  page: number;
  pageSize: number;
  isRouterReady: boolean;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setPagination: (page?: number, pageSize?: number) => void;
  resetToFirstPage: () => void;
}

export const usePaginationQueryParamState = ({
  defaultPage = 1,
  defaultPageSize = 25,
}: UsePaginationQueryParamStateOptions = {}): PaginationState => {
  const router = useRouter();

  // Get current values from URL or use defaults
  const currentPage = router.query.page ? Number(router.query.page) : defaultPage;
  const currentPageSize = router.query.pageSize ? Number(router.query.pageSize) : defaultPageSize;

  // Helper function to update pagination parameters atomically
  const updatePaginationParams = (newPage?: number, newPageSize?: number) => {
    const query = { ...router.query };

    if (newPage !== undefined) {
      query.page = String(newPage);
    }

    if (newPageSize !== undefined) {
      query.pageSize = String(newPageSize);
    }

    void router.push(
      {
        pathname: router.pathname,
        query,
      },
      undefined,
      { shallow: true }
    );
  };

  return {
    page: currentPage,
    pageSize: currentPageSize,
    isRouterReady: router.isReady,
    // Update only page param
    setPage: (page: number) => updatePaginationParams(page),
    // Update only page size param (resets to page 1)
    setPageSize: (pageSize: number) => updatePaginationParams(1, pageSize),
    // Update both page and page size params
    setPagination: (page?: number, pageSize?: number) => updatePaginationParams(page, pageSize),
    // Convenience method to reset to first page (page 1)
    resetToFirstPage: () => updatePaginationParams(1),
  };
};
