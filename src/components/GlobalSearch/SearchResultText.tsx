import { ENTITY_ICON } from '@/components/shared/entity-icons';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Icon } from '@/ui';

import { HighlightedText } from './HighlightedText';
import type { SearchResultItem } from './utils';

interface SearchResultTextProps {
  item: SearchResultItem;
  query: string;
  /** `sm` in the ⌘K list (secondary lines 12px), `md` on the Pretraga page (14px). */
  size?: 'sm' | 'md';
}

/** Title (+ „Agencijski” badge) and the secondary lines of a search result (labs /overlays/command, /search). */
export const SearchResultText = ({ item, query, size = 'sm' }: SearchResultTextProps) => {
  const secondary = cn('truncate text-muted-foreground', size === 'sm' ? 'text-xs' : 'text-sm');

  return (
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="flex min-w-0 items-center gap-2">
        <span className="truncate font-medium">
          <HighlightedText query={query} text={item.title} />
        </span>
        {item.isAgency && (
          <Badge className="shrink-0" size="sm" tone="category">
            <Icon icon={ENTITY_ICON.agency} size="xs" /> Agencijski
          </Badge>
        )}
      </span>
      {item.subtitle && (
        <span className={secondary}>
          <HighlightedText query={query} text={item.subtitle} />
        </span>
      )}
      {item.detail && (
        <span className={secondary}>
          {item.detail.label}: <HighlightedText query={query} text={item.detail.value} />
        </span>
      )}
      {item.matchedValue && (
        <span className={cn(secondary, 'text-muted-foreground/80')}>
          <HighlightedText query={query} text={item.matchedValue} />
        </span>
      )}
    </span>
  );
};
