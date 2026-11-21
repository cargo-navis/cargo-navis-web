import { Skeleton } from '@/components/ui/skeleton';

// Fixed, slightly different widths per row (px), so the placeholder doesn't read as a grid of identical bars
const ROWS = [
  { lines: [110, 190], aside: [150, 110] },
  { lines: [90, 150], aside: [130, 100] },
  { lines: [120, 210], aside: [160, 120] },
  { lines: [100, 170], aside: [140, 90] },
  { lines: [115, 140], aside: [120, 110] },
];

/** First-load placeholder for a card of results; mirrors SearchResultsList. */
export const SearchResultsSkeleton = ({ showAside, rows = ROWS.length }: { showAside: boolean; rows?: number }) => (
  <div aria-busy className="flex flex-col divide-y rounded-xl border bg-card p-1">
    {ROWS.slice(0, rows).map(({ lines, aside }, index) => (
      <div className="flex items-start gap-3 px-3 py-2.5" key={index}>
        <Skeleton className="mt-0.5 size-5 shrink-0 rounded-md" />
        <div className="flex min-w-0 flex-1 flex-col gap-2 pt-0.5">
          {lines.map((width, lineIndex) => (
            <Skeleton className={lineIndex === 0 ? 'h-3.5' : 'h-3'} key={lineIndex} style={{ width }} />
          ))}
        </div>
        {showAside && (
          <div className="hidden w-56 shrink-0 flex-col items-end gap-2 self-center sm:flex">
            {aside.map((width, lineIndex) => (
              <Skeleton className="h-3" key={lineIndex} style={{ width }} />
            ))}
          </div>
        )}
      </div>
    ))}
  </div>
);
