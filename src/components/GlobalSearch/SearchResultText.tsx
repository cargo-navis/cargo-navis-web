import { FlexLayout, Text } from '@/ui';

import { HighlightedText } from './HighlightedText';
import type { SearchResultItem } from './utils';

interface SearchResultTextProps {
  item: SearchResultItem;
  query: string;
}

export const SearchResultText = ({ item, query }: SearchResultTextProps) => (
  <FlexLayout className="flex-col min-w-0">
    <Text className="truncate" color="text-color-1" variant="text-s-medium">
      <HighlightedText query={query} text={item.title} />
    </Text>
    {item.subtitle && (
      <Text className="truncate" color="text-color-3" variant="text-xs">
        <HighlightedText query={query} text={item.subtitle} />
      </Text>
    )}
    {item.matchedValue && (
      <Text className="truncate" color="text-color-4" variant="text-xs">
        <HighlightedText query={query} text={item.matchedValue} />
      </Text>
    )}
  </FlexLayout>
);
