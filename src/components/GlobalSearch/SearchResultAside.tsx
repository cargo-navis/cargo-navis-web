import clsx from 'clsx';

import { Box, FlexLayout, Text, Tooltip } from '@/ui';

import { HighlightedText } from './HighlightedText';
import type { SearchResultItem } from './utils';

interface SearchResultAsideProps {
  aside: NonNullable<SearchResultItem['aside']>;
  query: string;
  // A fixed width (e.g. w-[220px]), so the column lines up across rows whatever the length of the text on the left
  className: string;
}

/** Right-aligned column beside a search result, e.g. a shipment's cargo. Used in the search modal and on the search page. */
export const SearchResultAside = ({ aside, query, className }: SearchResultAsideProps) => (
  <FlexLayout className={clsx('shrink-0 flex-col items-end text-right', className)}>
    {aside.primary && (
      <AsideTooltip lines={aside.primaryTooltip}>
        <Text className="block truncate" color="text-color-2" variant="text-xs">
          <HighlightedText query={query} text={aside.primary} />
        </Text>
      </AsideTooltip>
    )}
    {(aside.secondaryLead || aside.secondary) && (
      <Text className="max-w-full truncate" color="text-color-3" variant="text-xs">
        {aside.secondaryLead && (
          <Text color="text-color-1" variant="text-xs-medium">
            {aside.secondaryLead}
          </Text>
        )}
        {aside.secondaryLead && aside.secondary && (
          <Text color="text-color-4" variant="text-xs">
            {' • '}
          </Text>
        )}
        {aside.secondary}
      </Text>
    )}
  </FlexLayout>
);

const AsideTooltip = ({ lines, children }: { lines?: string[]; children: React.ReactElement }) => {
  // The Box caps the width so the text inside can be cut off with …; the tooltip anchors to it
  const anchor = <Box className="max-w-full min-w-0">{children}</Box>;
  if (!lines?.length) return anchor;

  return (
    <Tooltip
      content={
        <FlexLayout as="ul" className="flex-col gap-1 px-2 max-w-[320px]">
          {lines.map((line, index) => (
            <Text as="li" color="text-light-50" key={index} variant="text-xs">
              {line}
            </Text>
          ))}
        </FlexLayout>
      }
      isPortal
    >
      {anchor}
    </Tooltip>
  );
};
