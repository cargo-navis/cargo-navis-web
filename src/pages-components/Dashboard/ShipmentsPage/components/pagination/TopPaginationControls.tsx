import { FlexLayout, PageSizeSelector, Pagination, PaginationInfo } from '@/ui';

interface PaginationInfoProps {
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

interface TopPaginationControlsProps {
  paginationInfo: PaginationInfoProps;
  isLoading: boolean;
  pageSize: number;
  setPageSize(pageSize: number): void;
  setPage(page: number): void;
}

export const TopPaginationControls = ({
  paginationInfo,
  isLoading,
  pageSize,
  setPageSize,
  setPage,
}: TopPaginationControlsProps) => {
  return (
    <FlexLayout className="items-center justify-between mb-4 gap-4">
      <FlexLayout className="flex-col gap-3">
        <PageSizeSelector isLoading={isLoading} pageSize={pageSize} onPageSizeChange={setPageSize} />
        <PaginationInfo
          className="text-dark-600 dark:text-light-400"
          currentPage={paginationInfo.currentPage}
          pageSize={paginationInfo.pageSize}
          totalElements={paginationInfo.totalElements}
        />
      </FlexLayout>
      <FlexLayout className="items-center gap-4">
        <Pagination
          currentPage={paginationInfo.currentPage}
          isLoading={isLoading}
          totalPages={paginationInfo.totalPages}
          onPageChange={setPage}
        />
      </FlexLayout>
    </FlexLayout>
  );
};
