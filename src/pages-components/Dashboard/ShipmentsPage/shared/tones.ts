/**
 * Status colours outside a Badge (lines, icons, the line of text under a badge), as in the labs /tables, /routes,
 * /invoice, /order, on the status tokens of globals.css (light + dark). Red goes through `text-destructive`.
 */
export const STATUS_TEXT = {
  muted: 'text-muted-foreground',
  info: 'text-info',
  success: 'text-success',
  warning: 'font-medium text-warning',
  danger: 'font-medium text-destructive',
  oversize: 'text-orange-500',
} as const;

/** Progress lines of the route track. */
export const STATUS_BAR = {
  idle: 'bg-border',
  late: 'bg-destructive/40',
  partial: 'bg-info-dot/50',
  transit: 'bg-info-dot',
  done: 'bg-success-dot',
} as const;

export const STATUS_BORDER = {
  idle: 'border-border',
  late: 'border-destructive/40',
  transit: 'border-info-dot',
  done: 'border-success-dot',
} as const;

/** Status pills inside the tooltip (dark in both themes). */
export const TOOLTIP_PILL = {
  waiting: 'border-neutral-500 bg-neutral-800 text-neutral-300',
  late: 'border-red-700 bg-red-950 text-red-300',
  partial: 'border-blue-700 bg-blue-950 text-blue-300',
  transit: 'border-blue-700 bg-blue-950 text-blue-300',
  done: 'border-green-700 bg-green-950 text-green-300',
} as const;

/** Margin pill of agency nalozi (+ green, − red). */
export const MARGIN_PILL = {
  gain: 'bg-success-dot/10 text-success',
  loss: 'bg-destructive/10 text-destructive',
} as const;

/** Row tints (DECISIONS §5 Nalozi: subtler; warning = missing vehicle / driver, paid = green). */
export const ROW_TINT = {
  warning: 'bg-destructive/10 hover:bg-destructive/15',
  paid: 'bg-success-dot/10 hover:bg-success-dot/15',
} as const;

/** Missing vehicle / driver button: dashed red (lab assignment-cell, /order AssignmentPanel). */
export const MISSING_BUTTON =
  'border-dashed border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive dark:border-destructive/50';

/** The next stop on the Ruta: brand tint, and its marker. */
export const NEXT_STOP = {
  row: 'bg-primary/5 dark:bg-primary/25',
  marker: 'border-brand-solid ring-4 ring-primary/15',
} as const;

/** Links in text (petrol; lighter in dark). */
export const TEXT_LINK = 'font-medium text-brand hover:underline';

/** Ruta: the line after a done stop. */
export const DONE_LINE = 'bg-success-dot/60';

/** A route stop on the same day as a new one (Dodijeli vozilo „Isti dan”, lab /assign). */
export const CLASH_ROW = 'bg-warning-soft';

/** The „Danas · 10.11.” line in a vertical route (lab /assign, as Prijevozi's Ruta). */
export const TODAY_LINE = {
  text: 'text-brand',
  rule: 'bg-brand/30',
} as const;
