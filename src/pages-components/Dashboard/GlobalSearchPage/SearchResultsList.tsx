import Link from 'next/link';

import {
  addRecentSearchItem,
  type SearchCategory,
  SearchResultAside,
  type SearchResultItem,
  SearchResultText,
} from '@/components/GlobalSearch';
import { cn } from '@/lib/utils';
import { Icon } from '@/ui';

interface SearchResultsListProps {
  category: SearchCategory;
  items: SearchResultItem[];
  query: string;
  className?: string;
}

/** Card of result rows (lab /search `ResultRow`: the decided ⌘K row at page size). Click opens the result. */
export const SearchResultsList = ({ category, items, query, className }: SearchResultsListProps) => (
  <ul className={cn('flex flex-col divide-y rounded-xl border bg-card p-1', className)}>
    {items.map((item) => (
      <li key={item.id}>
        <Link
          className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left outline-none hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50"
          href={item.href}
          onClick={() =>
            addRecentSearchItem({
              category: category.key,
              id: item.id,
              href: item.href,
              title: item.title,
              subtitle: item.subtitle,
            })
          }
        >
          <Icon className="mt-0.5 text-muted-foreground" icon={category.icon} size="m" />
          <SearchResultText item={item} query={query} size="md" />
          {item.aside && <SearchResultAside aside={item.aside} className="hidden w-56 text-sm sm:flex" query={query} />}
        </Link>
      </li>
    ))}
  </ul>
);
