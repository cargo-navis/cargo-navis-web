import Link from 'next/link';

import { HighlightedText, type SearchResultItem } from '@/components/GlobalSearch';
import { Box, FlexLayout, Icon, type IconType, Text } from '@/ui';

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
          <FlexLayout className="flex-col min-w-0">
            <Text className="truncate" color="text-color-1" variant="text-s-medium">
              <HighlightedText query={query} text={item.title} />
            </Text>
            {item.subtitle && (
              <Text className="truncate" color="text-color-3" variant="text-xs">
                <HighlightedText query={query} text={item.subtitle} />
              </Text>
            )}
          </FlexLayout>
        </Link>
      </li>
    ))}
  </Box>
);
