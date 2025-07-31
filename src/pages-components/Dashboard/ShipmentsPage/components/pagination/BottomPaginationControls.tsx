import { FlexLayout, Pagination, PaginationInfo } from '@/ui';

interface PaginationInfoProps {
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

interface BottomPaginationControlsProps {
  paginationInfo: PaginationInfoProps;
  isLoading: boolean;
  setPage(page: number): void;
}

export const BottomPaginationControls = ({ paginationInfo, isLoading, setPage }: BottomPaginationControlsProps) => {
  return (
    <FlexLayout className="items-center justify-between mt-4 gap-4">
      <PaginationInfo
        className="text-dark-600 dark:text-light-400"
        currentPage={paginationInfo.currentPage}
        pageSize={paginationInfo.pageSize}
        totalElements={paginationInfo.totalElements}
      />
      <Pagination
        currentPage={paginationInfo.currentPage}
        isLoading={isLoading}
        totalPages={paginationInfo.totalPages}
        onPageChange={setPage}
      />
    </FlexLayout>
  );
};
