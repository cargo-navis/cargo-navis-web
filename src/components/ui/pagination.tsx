import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Icon } from '@/ui';

function Pagination({ className, ...props }: React.ComponentProps<'nav'>) {
  return (
    <nav
      aria-label="Stranice"
      className={cn('mx-auto flex w-full justify-center', className)}
      data-slot="pagination"
      role="navigation"
      {...props}
    />
  );
}

function PaginationContent({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul className={cn('flex items-center gap-0.5', className)} data-slot="pagination-content" {...props} />;
}

function PaginationItem({ ...props }: React.ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
} & Pick<React.ComponentProps<typeof Button>, 'size'> &
  React.ComponentProps<'a'>;

/**
 * Decided (KAN-55, /overlays/pagination): count above the table, pages below only; numbers with ellipsis
 * (`paginationPages`), arrows only (no Prethodna / Sljedeća words), current page grey (our „selected” look), 32px,
 * scroll to the table top after a change. Phones and narrow cards: `PaginationCompact` („‹ 3 od 25 ›”, 40px).
 */
function PaginationLink({ className, isActive, size = 'icon-sm', ...props }: PaginationLinkProps) {
  return (
    <Button
      className={cn('tabular-nums', isActive && 'bg-secondary text-secondary-foreground hover:bg-secondary', className)}
      nativeButton={false}
      render={
        <a aria-current={isActive ? 'page' : undefined} data-active={isActive} data-slot="pagination-link" {...props} />
      }
      size={size}
      variant="ghost"
    />
  );
}

function PaginationPrevious({
  className,
  disabled,
  ...props
}: React.ComponentProps<typeof PaginationLink> & { disabled?: boolean }) {
  return (
    <PaginationLink
      aria-disabled={disabled || undefined}
      aria-label="Prethodna stranica"
      className={cn(disabled && 'pointer-events-none opacity-50', className)}
      {...props}
    >
      <Icon icon="IconChevronLeft" size="s" />
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  disabled,
  ...props
}: React.ComponentProps<typeof PaginationLink> & { disabled?: boolean }) {
  return (
    <PaginationLink
      aria-disabled={disabled || undefined}
      aria-label="Sljedeća stranica"
      className={cn(disabled && 'pointer-events-none opacity-50', className)}
      {...props}
    >
      <Icon icon="IconChevronRight" size="s" />
    </PaginationLink>
  );
}

function PaginationEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-8 items-center justify-center text-muted-foreground [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      data-slot="pagination-ellipsis"
      {...props}
    >
      <Icon icon="IconDots" size="s" />
      <span className="sr-only">Još stranica</span>
    </span>
  );
}

/** Page numbers to show: first, last, the current one and its neighbours; "…" for gaps. */
function paginationPages(page: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const pages: (number | '…')[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);
  if (start > 2) pages.push('…');
  for (let index = start; index <= end; index++) pages.push(index);
  if (end < total - 1) pages.push('…');
  pages.push(total);
  return pages;
}

/** Phones and narrow cards: „‹ 3 od 25 ›”. */
function PaginationCompact({
  page,
  pages,
  onPageChange,
  className,
}: {
  page: number;
  pages: number;
  onPageChange(page: number): void;
  className?: string;
}) {
  return (
    <nav
      aria-label="Stranice"
      className={cn('flex w-full items-center justify-between gap-2', className)}
      data-slot="pagination-compact"
    >
      <Button
        aria-label="Prethodna stranica"
        disabled={page <= 1}
        size="icon"
        variant="ghost"
        onClick={() => onPageChange(page - 1)}
      >
        <Icon icon="IconChevronLeft" size="s" />
      </Button>
      <span className="text-sm tabular-nums">
        <b className="font-medium">{page}</b> <span className="text-muted-foreground">od {pages}</span>
      </span>
      <Button
        aria-label="Sljedeća stranica"
        disabled={page >= pages}
        size="icon"
        variant="ghost"
        onClick={() => onPageChange(page + 1)}
      >
        <Icon icon="IconChevronRight" size="s" />
      </Button>
    </nav>
  );
}

export {
  Pagination,
  PaginationCompact,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  paginationPages,
  PaginationPrevious,
};
