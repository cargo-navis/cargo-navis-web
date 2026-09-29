import { getSearchCategoryTotal, SEARCH_CATEGORIES, type SearchCategory } from '@/components/GlobalSearch';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { GLOBAL_SEARCH_MIN_LENGTH, useGlobalSearch } from '@/lib/hooks';
import { Box, FlexLayout, Heading, Pagination, Text } from '@/ui';

import { SearchResultsList } from './SearchResultsList';
import { useSearchPageParams } from './useSearchPageParams';

const PAGE_SIZE = 20;

export const GlobalSearchPage = () => {
  const { query, type, page, isReady, setPage } = useSearchPageParams();
  const category = SEARCH_CATEGORIES.find(({ key }) => key === type);
  const title = category && query ? `${category.heading} za „${query}“` : 'Pretraživanje';

  return (
    <DashboardLayout>
      <PageTitle title={title} />
      <Heading as="h1" variant="text-xl">
        {title}
      </Heading>
      {isReady &&
        (category ? (
          <SearchResults category={category} page={page} query={query} setPage={setPage} />
        ) : (
          // Reached via "Prikaži svih" links from global search, which always set the category
          <StatusMessage text="Odaberite kategoriju u tražilici." />
        ))}
    </DashboardLayout>
  );
};

interface SearchResultsProps {
  category: SearchCategory;
  query: string;
  page: number;
  setPage(page: number): void;
}

const SearchResults = ({ category, query, page, setPage }: SearchResultsProps) => {
  const { data, isError, isFetching, isPlaceholderData } = useGlobalSearch(query, {
    types: [category.type],
    limit: PAGE_SIZE,
    page: page - 1,
  });

  if (query.length < GLOBAL_SEARCH_MIN_LENGTH) {
    return <StatusMessage text={`Upišite najmanje ${GLOBAL_SEARCH_MIN_LENGTH} znaka u tražilicu.`} />;
  }
  if (isError) return <StatusMessage text="Pretraživanje nije uspjelo. Pokušajte ponovno." />;
  // Placeholder data belongs to the previous query/page, so show a loader instead
  if (!data || isPlaceholderData) return <LoadingPage />;

  const items = category.mapItems(data);
  if (items.length === 0) return <StatusMessage text="Nema rezultata." />;

  const total = getSearchCategoryTotal(data, category.key);
  const totalPages = Math.ceil(total / PAGE_SIZE);

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
    window.scrollTo({ top: 0 });
  }

  return (
    <Box>
      <Text as="p" className="mt-1" color="text-color-3">
        Ukupno rezultata: {total}
      </Text>
      <FlexLayout className="flex-col gap-5 py-5">
        <SearchResultsList icon={category.icon} items={items} query={query} />
        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            isLoading={isFetching}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </FlexLayout>
    </Box>
  );
};

const StatusMessage = ({ text }: { text: string }) => (
  <Text as="p" className="py-6" color="text-color-3">
    {text}
  </Text>
);
