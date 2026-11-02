import { Box, FlexLayout, Skeleton } from '@/ui';

// Fixed, slightly different widths per row (px), so the placeholder doesn't read as a grid of identical bars
const ROWS = [
  { lines: [110, 190, 260], aside: [150, 110] },
  { lines: [90, 150, 220], aside: [130, 100] },
  { lines: [120, 210, 180], aside: [160, 120] },
  { lines: [100, 170, 240], aside: [140, 90] },
  { lines: [115, 140, 200], aside: [120, 110] },
  { lines: [95, 200, 230], aside: [150, 100] },
];

/** Placeholder for the search page while results load; mirrors the rows of SearchResultsList. */
export const SearchResultsSkeleton = ({ showAside }: { showAside: boolean }) => (
  <Box>
    {/* "Ukupno rezultata: N" */}
    <Box className="mt-1">
      <Skeleton borderRadius="xs" height={24} width={140} />
    </Box>
    <Box as="ul" className="flex flex-col max-w-[760px] py-5 divide-y divide-dark-100 dark:divide-light-900">
      {ROWS.map(({ lines, aside }, index) => (
        // Same height as a typical result row (three lines of text), so nothing jumps when results arrive
        <li className="h-[88px] py-1" key={index}>
          <FlexLayout className="h-full items-start gap-3 p-2">
            <Box className="shrink-0">
              <Skeleton borderRadius="m" height={40} width={40} />
            </Box>
            <FlexLayout className="flex-1 min-w-0 flex-col gap-2 pt-[2px]">
              {lines.map((width, lineIndex) => (
                <Skeleton borderRadius="xs" height={lineIndex === 0 ? 14 : 12} key={lineIndex} width={width} />
              ))}
            </FlexLayout>
            {showAside && (
              // Centred in the row, like the cargo column in SearchResultsList
              <FlexLayout className="w-[220px] shrink-0 self-center flex-col items-end gap-2">
                {aside.map((width, lineIndex) => (
                  <Skeleton borderRadius="xs" height={12} key={lineIndex} width={width} />
                ))}
              </FlexLayout>
            )}
          </FlexLayout>
        </li>
      ))}
    </Box>
  </Box>
);
