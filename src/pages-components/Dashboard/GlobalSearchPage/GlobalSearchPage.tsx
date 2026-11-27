import {
  getSearchCategoryTotal,
  SEARCH_CATEGORIES,
  type SearchCategory,
  type SearchCategoryKey,
} from '@/components/GlobalSearch';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { Dimmed } from '@/components/shared/loading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  paginationPages,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GLOBAL_SEARCH_MIN_LENGTH, useDelayedFlag, useGlobalSearch } from '@/lib/hooks';
import { plural } from '@/lib/utils/plural';
import { Icon } from '@/ui';

import { SearchResultsList } from './SearchResultsList';
import { SearchResultsSkeleton } from './SearchResultsSkeleton';
import { useSearchPageParams } from './useSearchPageParams';

const PAGE_SIZE = 20;
const ALL_PER_CATEGORY = 5;

/**
 * Pretraga (DECISIONS §5, lab /search): „Pretraga za „x”” (the query comes from the top-bar search, no field here),
 * tabs Sve + categories with counts (Sve = top 5 per category + „Prikaži svih N …”), ⌘K rows, 20 per page. Query, tab
 * and page live in the URL (?query=…&type=…&page=…).
 */
export const GlobalSearchPage = () => {
  const { query, type, page, isReady, setPage, setType } = useSearchPageParams();
  const title = query ? `Pretraga za „${query}”` : 'Pretraga';

  return (
    <DashboardLayout>
      <PageTitle title={title} />
      <div className="flex flex-col gap-5">
        <h1 className="font-heading text-3xl font-bold tracking-tight">{title}</h1>
        {isReady &&
          (query.length < GLOBAL_SEARCH_MIN_LENGTH ? (
            <p className="py-6 text-sm text-muted-foreground">
              Upiši najmanje {GLOBAL_SEARCH_MIN_LENGTH} znaka u tražilicu.
            </p>
          ) : (
            <SearchResults page={page} query={query} setPage={setPage} setType={setType} type={type} />
          ))}
      </div>
    </DashboardLayout>
  );
};

interface SearchResultsProps {
  query: string;
  type: SearchCategoryKey | undefined;
  page: number;
  setPage(page: number): void;
  setType(type: SearchCategoryKey | undefined): void;
}

const SearchResults = ({ query, type, page, setPage, setType }: SearchResultsProps) => {
  // Every category's total (tab counts) + its top 5 (Sve).
  const { data, isError, isFetching, isPlaceholderData, refetch } = useGlobalSearch(query);
  const showDimmed = useDelayedFlag(isFetching && isPlaceholderData);

  if (isError && !data) return <SearchError onRetry={() => void refetch()} />;
  if (!data) return <SearchResultsSkeleton showAside />;

  const total = SEARCH_CATEGORIES.reduce((sum, category) => sum + getSearchCategoryTotal(data, category.key), 0);
  if (total === 0 && !isPlaceholderData) {
    return (
      <div className="rounded-xl border">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon icon="IconSearch" size="m" />
            </EmptyMedia>
            <EmptyTitle>Nema rezultata za „{query}”</EmptyTitle>
            <EmptyDescription>Probaj dio broja naloga, registraciju bez razmaka, OIB ili mjesto.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  const category = type ? SEARCH_CATEGORIES.find((item) => item.key === type) : undefined;

  return (
    <>
      <Tabs
        value={type ?? 'all'}
        onValueChange={(value) => setType(value === 'all' ? undefined : (value as SearchCategoryKey))}
      >
        <TabsList className="no-scrollbar max-w-full overflow-x-auto" variant="line">
          <TabsTrigger value="all">
            Sve <Badge size="sm">{total}</Badge>
          </TabsTrigger>
          {SEARCH_CATEGORIES.map((item) => {
            const count = getSearchCategoryTotal(data, item.key);
            return (
              <TabsTrigger disabled={count === 0} key={item.key} value={item.key}>
                {item.heading} <Badge size="sm">{count}</Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {category ? (
        <CategoryResults category={category} key={category.key} page={page} query={query} setPage={setPage} />
      ) : (
        <Dimmed className="flex flex-col gap-6" when={showDimmed}>
          {SEARCH_CATEGORIES.map((item) => {
            const items = item.mapItems(data);
            if (items.length === 0) return null;
            const count = getSearchCategoryTotal(data, item.key);
            return (
              <section className="flex flex-col gap-2" key={item.key}>
                <h2 className="flex items-center gap-2 font-heading text-base font-bold tracking-tight">
                  {item.heading} <Badge size="sm">{count}</Badge>
                </h2>
                <SearchResultsList category={item} items={items.slice(0, ALL_PER_CATEGORY)} query={query} />
                {count > Math.min(items.length, ALL_PER_CATEGORY) && (
                  <Button className="w-fit" size="sm" variant="ghost" onClick={() => setType(item.key)}>
                    Prikaži svih {count} {item.pluralNoun}
                    <Icon data-icon="inline-end" icon="IconArrowRight" size="s" />
                  </Button>
                )}
              </section>
            );
          })}
        </Dimmed>
      )}
    </>
  );
};

interface CategoryResultsProps {
  category: SearchCategory;
  query: string;
  page: number;
  setPage(page: number): void;
}

const CategoryResults = ({ category, query, page, setPage }: CategoryResultsProps) => {
  const { data, isError, isFetching, isPlaceholderData, refetch } = useGlobalSearch(query, {
    types: [category.type],
    limit: PAGE_SIZE,
    page: page - 1,
  });
  const showDimmed = useDelayedFlag(isFetching && isPlaceholderData);

  if (isError && !data) return <SearchError onRetry={() => void refetch()} />;
  // Only shipments have the cargo column on the right.
  if (!data) return <SearchResultsSkeleton showAside={category.key === 'shipments'} />;

  const items = category.mapItems(data);
  const total = getSearchCategoryTotal(data, category.key);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function go(next: number) {
    setPage(next);
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm text-muted-foreground tabular-nums">
        {total} {plural(total, category.forms)}
        {pages > 1 && ` · stranica ${page} od ${pages}`}
      </span>
      <Dimmed when={showDimmed}>
        <SearchResultsList category={category} items={items} query={query} />
      </Dimmed>
      {pages > 1 && (
        <Pagination className="mx-0 w-auto justify-start">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                disabled={page === 1}
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  go(page - 1);
                }}
              />
            </PaginationItem>
            {paginationPages(page, pages).map((entry, index) =>
              entry === '…' ? (
                <PaginationItem key={`gap-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={entry}>
                  <PaginationLink
                    href="#"
                    isActive={entry === page}
                    onClick={(event) => {
                      event.preventDefault();
                      go(entry);
                    }}
                  >
                    {entry}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                disabled={page === pages}
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  go(page + 1);
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

const SearchError = ({ onRetry }: { onRetry(): void }) => (
  <div className="rounded-xl border">
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="danger">
          <Icon icon="IconAlertTriangle" size="m" />
        </EmptyMedia>
        <EmptyTitle>Pretraživanje nije uspjelo</EmptyTitle>
        <EmptyDescription>Provjeri vezu pa pokušaj ponovno.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={onRetry}>
          <Icon data-icon="inline-start" icon="IconRefresh" size="s" /> Pokušaj ponovno
        </Button>
      </EmptyContent>
    </Empty>
  </div>
);
