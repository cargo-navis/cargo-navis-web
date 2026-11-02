import Link from 'next/link';

import { SearchResultAside, type SearchResultItem, SearchResultText } from '@/components/GlobalSearch';
import { Box, FlexLayout, Icon, type IconType } from '@/ui';

interface SearchResultsListProps {
  items: SearchResultItem[];
  icon: IconType;
  query: string;
}

export const SearchResultsList = ({ items, icon, query }: SearchResultsListProps) => (
  <Box as="ul" className="flex flex-col max-w-[760px] divide-y divide-dark-100 dark:divide-light-900">
    {items.map((item) => (
      <li className="py-1" key={item.id}>
        <Link
          className="flex items-center gap-3 p-2 rounded-s hover:bg-dark-50 dark:hover:bg-light-800"
          href={item.href}
        >
          <FlexLayout className="self-start shrink-0 items-center justify-center w-[40px] h-[40px] rounded-m border border-dark-200 dark:border-light-800 text-dark-600 dark:text-light-300">
            <Icon icon={icon} size="xl" />
          </FlexLayout>
          <Box className="flex-1 min-w-0">
            <SearchResultText item={item} query={query} />
          </Box>
          {item.aside && <SearchResultAside aside={item.aside} className="w-[220px]" query={query} />}
        </Link>
      </li>
    ))}
  </Box>
);
