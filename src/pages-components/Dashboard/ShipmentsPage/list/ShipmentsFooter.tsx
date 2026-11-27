/**
 * Under the table (lab /overlays/pagination, /tables): the count, „Po stranici” (10 / 25 / 50 / 100, remembered) and
 * the pages (numbers with ellipsis, arrows only, current page grey, 32px). Narrow screens: „‹ 3 od 25 ›”.
 */

import {
  Pagination,
  PaginationCompact,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  paginationPages,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/lib/hooks';

export const PAGE_SIZES = [10, 25, 50, 100];

export function ShipmentsFooter({
  page,
  pageCount,
  pageSize,
  resultsLabel,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageCount: number;
  pageSize: number;
  resultsLabel: string;
  onPageChange(page: number): void;
  onPageSizeChange(pageSize: number): void;
}) {
  const isMobile = useIsMobile();

  const pageSizeSelect = (
    <div className="flex items-center gap-2">
      <span className="whitespace-nowrap">Po stranici</span>
      <Select
        items={PAGE_SIZES.map((size) => ({ value: String(size), label: String(size) }))}
        value={String(pageSize)}
        onValueChange={(value) => value && onPageSizeChange(Number(value))}
      >
        <SelectTrigger className="w-20" size="sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAGE_SIZES.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  if (isMobile) {
    return (
      <div className="flex flex-col gap-3 text-sm text-muted-foreground">
        {pageCount > 1 && <PaginationCompact page={page} pages={pageCount} onPageChange={onPageChange} />}
        <div className="flex items-center justify-between gap-3">
          <span className="tabular-nums">{resultsLabel}</span>
          {pageSizeSelect}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <span className="tabular-nums">{resultsLabel}</span>
      <div className="flex items-center gap-4">
        {pageSizeSelect}
        {pageCount > 1 && (
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  disabled={page <= 1}
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    onPageChange(page - 1);
                  }}
                />
              </PaginationItem>
              {paginationPages(page, pageCount).map((item, index) =>
                item === '…' ? (
                  <PaginationItem key={`gap-${index}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={item}>
                    <PaginationLink
                      href="#"
                      isActive={item === page}
                      onClick={(event) => {
                        event.preventDefault();
                        onPageChange(item);
                      }}
                    >
                      {item}
                    </PaginationLink>
                  </PaginationItem>
                )
              )}
              <PaginationItem>
                <PaginationNext
                  disabled={page >= pageCount}
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    onPageChange(page + 1);
                  }}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
