import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { HighlightedText } from './HighlightedText';
import type { SearchResultItem } from './utils';

interface SearchResultAsideProps {
  aside: NonNullable<SearchResultItem['aside']>;
  query: string;
  // A fixed width (e.g. w-56), so the column lines up across rows whatever the length of the text on the left
  className: string;
}

/**
 * Right-aligned column beside a search result, e.g. a shipment's cargo („Konzerve +1” / „14 paleta · 9.300 kg”). Used
 * in ⌘K and on the Pretraga page; the first line's tooltip lists every cargo description.
 */
export const SearchResultAside = ({ aside, query, className }: SearchResultAsideProps) => (
  <span className={cn('flex shrink-0 flex-col items-end text-right', className)}>
    {aside.primary && (
      <AsideTooltip lines={aside.primaryTooltip}>
        <span className="block max-w-full truncate">
          <HighlightedText query={query} text={aside.primary} />
        </span>
      </AsideTooltip>
    )}
    {(aside.secondaryLead || aside.secondary) && (
      <span className="max-w-full truncate text-muted-foreground">
        {aside.secondaryLead && <span className="font-medium text-foreground">{aside.secondaryLead}</span>}
        {aside.secondaryLead && aside.secondary && ' · '}
        {aside.secondary}
      </span>
    )}
  </span>
);

const AsideTooltip = ({ lines, children }: { lines?: string[]; children: React.ReactElement }) => {
  if (!lines?.length) return children;

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="block max-w-full min-w-0" />}>{children}</TooltipTrigger>
      <TooltipContent className="max-w-80">
        <ul className="flex flex-col gap-1">
          {lines.map((line, index) => (
            <li key={index}>{line}</li>
          ))}
        </ul>
      </TooltipContent>
    </Tooltip>
  );
};
