import * as React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ReferenceLine, XAxis, YAxis } from 'recharts';

import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { formatDateShort } from '@/lib/utils/date';
import { Icon } from '@/ui';

import { compact } from './format';

/** One period: both API calls (counts and prices) merged, with its labels. */
export interface Period {
  key: string;
  label: string;
  long: string;
  /** The current period, not finished yet: lighter bar + „u tijeku”. */
  partial: boolean;
  countRegular: number;
  countAgency: number;
  revenueRegular: number;
  revenueAgency: number;
  costAgency: number;
}

/**
 * Series colours (DECISIONS §3 Charts, lab /analytics; validated for colour blindness, no blue next to violet):
 * Vlastiti teal, Agencijski = the agency colour (violet, follows `--agency-*`), Trošak orange, RUC green, loss red.
 */
export const CHART_CONFIG = {
  countRegular: { label: 'Vlastiti', color: 'var(--series-regular)' },
  countAgency: { label: 'Agencijski', color: 'var(--series-agency)' },
  revenueRegular: { label: 'Vlastiti', color: 'var(--series-regular)' },
  revenueAgency: { label: 'Agencijski', color: 'var(--series-agency)' },
  revenueAgencyLine: { label: 'Prihod', color: 'var(--series-agency)' },
  costAgency: { label: 'Trošak', color: 'var(--series-cost)' },
  margin: { label: 'RUC', color: 'var(--series-margin)' },
} satisfies ChartConfig;

type SeriesKey = keyof typeof CHART_CONFIG;

export interface Series {
  key: SeriesKey;
  value(period: Period): number;
  format(value: number): string;
  mark: 'bar' | 'line';
  /** Bars below zero in the loss colour (RUC). */
  signed?: boolean;
}

const AXES = (
  <>
    <CartesianGrid vertical={false} />
    <XAxis axisLine={false} dataKey="label" minTickGap={12} tickLine={false} tickMargin={8} />
    <YAxis axisLine={false} tickFormatter={compact} tickLine={false} width={48} />
  </>
);

function Legend({ series }: { series: Series[] }) {
  if (series.length < 2) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {series.map((item) => (
        <span className="flex items-center gap-1.5" key={item.key}>
          <span
            className={cn('shrink-0', item.mark === 'bar' ? 'size-2.5 rounded-[3px]' : 'h-0.5 w-3 rounded-full')}
            style={{ background: CHART_CONFIG[item.key].color }}
          />
          {CHART_CONFIG[item.key].label}
        </span>
      ))}
    </div>
  );
}

/** Tooltip title: the period's long label („studeni 2026. · u tijeku”). */
function longLabel(_: unknown, payload: readonly { payload?: { long?: string } }[] | undefined) {
  return <span className="capitalize">{payload?.[0]?.payload?.long}</span>;
}

/**
 * One chart per question, one axis (DECISIONS §3 Charts): bars ≤ 24px with a 4px rounded top and a 2px gap between
 * stacked segments, the unfinished period lighter + „u tijeku”, a legend from 2 series, and a Grafikon / Tablica
 * switch for exact numbers without hovering (and for screen readers).
 */
export function ChartCard({
  title,
  subtitle,
  periods,
  series,
  stacked,
  dim,
  zeroLine,
  today,
}: {
  title: string;
  subtitle?: string;
  periods: Period[];
  series: Series[];
  stacked?: boolean;
  dim?: boolean;
  zeroLine?: boolean;
  today: Date;
}) {
  const [mode, setMode] = React.useState<'chart' | 'table'>('chart');
  const rows = periods.map((period) => ({
    label: period.label,
    long: period.partial ? `${period.long} · u tijeku` : period.long,
    ...Object.fromEntries(series.map((item) => [item.key, item.value(period)])),
  }));
  const config = Object.fromEntries(series.map((item) => [item.key, CHART_CONFIG[item.key]])) as ChartConfig;
  const format = series[0].format;
  const bars = series.filter((item) => item.mark === 'bar');
  const many = periods.length > 16;
  const last = periods.at(-1);

  return (
    <section
      className={cn(
        'flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-4 transition-opacity',
        dim && 'opacity-50'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-base font-bold tracking-tight">{title}</h2>
          {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
          <Legend series={series} />
        </div>
        <ButtonGroup>
          <Button
            aria-label="Grafikon"
            aria-pressed={mode === 'chart'}
            size="icon-sm"
            variant={mode === 'chart' ? 'secondary' : 'outline'}
            onClick={() => setMode('chart')}
          >
            <Icon icon="IconChartBar" size="s" />
          </Button>
          <Button
            aria-label="Tablica"
            aria-pressed={mode === 'table'}
            size="icon-sm"
            variant={mode === 'table' ? 'secondary' : 'outline'}
            onClick={() => setMode('table')}
          >
            <Icon icon="IconTable" size="s" />
          </Button>
        </ButtonGroup>
      </div>

      {periods.length === 0 ? (
        <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
          Nema podataka za odabrano razdoblje.
        </div>
      ) : mode === 'table' ? (
        <div className="max-h-64 overflow-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted hover:bg-muted">
                <TableHead>Razdoblje</TableHead>
                {series.map((item) => (
                  <TableHead className="text-right" key={item.key}>
                    {CHART_CONFIG[item.key].label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {periods.map((period) => (
                <TableRow key={period.key}>
                  <TableCell className="py-2 capitalize">
                    {period.partial ? `${period.long} · u tijeku` : period.long}
                  </TableCell>
                  {series.map((item) => (
                    <TableCell className="py-2 text-right tabular-nums" key={item.key}>
                      {item.format(item.value(period))}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <ChartContainer className="aspect-auto h-56 w-full" config={config}>
          {bars.length > 0 ? (
            <BarChart
              accessibilityLayer
              barCategoryGap={many ? '20%' : '35%'}
              data={rows}
              margin={{ left: 0, right: 8, top: 8 }}
            >
              {AXES}
              {zeroLine && <ReferenceLine stroke="var(--border)" y={0} />}
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <span
                            className="h-0.5 w-3 rounded-full"
                            style={{ background: CHART_CONFIG[name as SeriesKey].color }}
                          />
                          {CHART_CONFIG[name as SeriesKey].label}
                        </span>
                        <span className="font-medium text-foreground tabular-nums">{format(Number(value))}</span>
                      </div>
                    )}
                    hideIndicator
                    labelFormatter={longLabel}
                  />
                }
                cursor={{ fill: 'var(--muted)', opacity: 0.6 }}
              />
              {bars.map((item, index) => (
                <Bar
                  dataKey={item.key}
                  fill={`var(--color-${item.key})`}
                  key={item.key}
                  maxBarSize={24}
                  // 4px rounded data end, square at the baseline; a 2px surface gap between stacked segments.
                  radius={!stacked || index === bars.length - 1 ? [4, 4, 0, 0] : 0}
                  stackId={stacked ? 'a' : undefined}
                  stroke="var(--card)"
                  strokeWidth={stacked ? 2 : 0}
                >
                  {/* The unfinished current period is lighter, so its lower total doesn't read as a drop. */}
                  {periods.map((period) => (
                    <Cell
                      // An explicit fill: `undefined` on a Cell overrides the Bar's fill and paints it black.
                      fill={item.signed && item.value(period) < 0 ? 'var(--series-loss)' : `var(--color-${item.key})`}
                      fillOpacity={period.partial ? 0.4 : 1}
                      key={period.key}
                    />
                  ))}
                </Bar>
              ))}
            </BarChart>
          ) : (
            <LineChart accessibilityLayer data={rows} margin={{ left: 0, right: 8, top: 8 }}>
              {AXES}
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <span
                            className="h-0.5 w-3 rounded-full"
                            style={{ background: CHART_CONFIG[name as SeriesKey].color }}
                          />
                          {CHART_CONFIG[name as SeriesKey].label}
                        </span>
                        <span className="font-medium text-foreground tabular-nums">{format(Number(value))}</span>
                      </div>
                    )}
                    hideIndicator
                    labelFormatter={longLabel}
                  />
                }
              />
              {series.map((item) => (
                <Line
                  activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--card)' }}
                  dataKey={item.key}
                  dot={false}
                  key={item.key}
                  stroke={`var(--color-${item.key})`}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          )}
        </ChartContainer>
      )}

      {mode === 'chart' && last?.partial && (
        <span className="text-xs text-muted-foreground">
          Svjetlije: {last.label} je u tijeku (do {formatDateShort(today)}).
        </span>
      )}
    </section>
  );
}

export function ChartCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-4">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-56 w-full" />
    </div>
  );
}
