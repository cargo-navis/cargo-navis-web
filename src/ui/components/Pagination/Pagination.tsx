import clsx from 'clsx';
import type React from 'react';

import { Button, FlexLayout, Text } from '@/ui';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  showPageNumbers?: boolean;
  maxVisiblePages?: number;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  showPageNumbers = true,
  maxVisiblePages = 5,
}) => {
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  // Calculate which page numbers to show
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + maxVisiblePages - 1);

    // Adjust start if we're near the end
    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();
  const showStartEllipsis = visiblePages[0] > 2;
  const showEndEllipsis = visiblePages[visiblePages.length - 1] < totalPages - 1;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <FlexLayout className="items-center gap-2">
      {/* Previous Button */}
      <Button
        iconLeft="ChevronLeftIcon"
        isDisabled={isFirstPage || isLoading}
        size="s"
        text="Prethodna"
        variant="secondary"
        onClick={() => onPageChange(currentPage - 1)}
      />

      {showPageNumbers && (
        <FlexLayout className="items-center gap-2">
          {/* First page */}
          {visiblePages[0] > 1 && (
            <>
              <PageButton currentPage={currentPage} isLoading={isLoading} page={1} onPageChange={onPageChange} />
              {showStartEllipsis && <Ellipsis />}
            </>
          )}

          {/* Visible page numbers */}
          {visiblePages.map((page) => (
            <PageButton
              currentPage={currentPage}
              isLoading={isLoading}
              key={page}
              page={page}
              onPageChange={onPageChange}
            />
          ))}

          {/* Last page */}
          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {showEndEllipsis && <Ellipsis />}
              <PageButton
                currentPage={currentPage}
                isLoading={isLoading}
                page={totalPages}
                onPageChange={onPageChange}
              />
            </>
          )}
        </FlexLayout>
      )}

      {/* Next Button */}
      <Button
        iconRight="ChevronRightIcon"
        isDisabled={isLastPage || isLoading}
        size="s"
        text="Sljedeća"
        variant="secondary"
        onClick={() => onPageChange(currentPage + 1)}
      />
    </FlexLayout>
  );
};

// Page Button Component
interface PageButtonProps {
  page: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const PageButton: React.FC<PageButtonProps> = ({ page, currentPage, onPageChange, isLoading }) => {
  const isActive = page === currentPage;

  return (
    <button
      aria-current={isActive ? 'page' : undefined}
      aria-label={`Go to page ${page}`}
      className={clsx(
        'w-6 h-6 flex items-center justify-center rounded-s text-xs-medium transition-colors duration-75',
        'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1',
        isActive
          ? 'bg-teal-700 text-white dark:bg-teal-600 dark:text-dark-75'
          : 'bg-white dark:bg-transparent text-dark-800 dark:text-light-50 border border-dark-200 dark:border-light-800 hover:bg-black-alpha-05 hover:dark:bg-white-alpha-25',
        isLoading && 'opacity-50 cursor-not-allowed'
      )}
      disabled={isLoading}
      type="button"
      onClick={() => onPageChange(page)}
    >
      {page}
    </button>
  );
};

// Ellipsis Component
const Ellipsis: React.FC = () => (
  <Text className="px-1" color="text-color-2" variant="text-xs-medium">
    ...
  </Text>
);
