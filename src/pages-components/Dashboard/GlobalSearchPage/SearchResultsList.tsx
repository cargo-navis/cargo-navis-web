import Link from 'next/link';

import { type SearchResultItem, SearchResultText } from '@/components/GlobalSearch';
import { Box, FlexLayout, Icon, type IconType } from '@/ui';

interface SearchResultsListProps {
  items: SearchResultItem[];
  icon: IconType;
  query: string;
}

export const SearchResultsList = ({ items, icon, query }: SearchResultsListProps) => (
  <Box as="ul" className="flex flex-col gap-1">
    {items.map((item) => (
      <li key={item.id}>
        <Link
          className="flex items-center gap-3 p-2 rounded-s hover:bg-dark-50 dark:hover:bg-light-800"
          href={item.href}
        >
          <FlexLayout className="shrink-0 items-center justify-center w-[40px] h-[40px] rounded-m border border-dark-100 dark:border-light-800 text-dark-600 dark:text-light-300">
            <Icon icon={icon} size="xl" />
          </FlexLayout>
          <SearchResultText item={item} query={query} />
        </Link>
      </li>
    ))}
  </Box>
);
