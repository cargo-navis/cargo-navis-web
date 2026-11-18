/**
 * Status colours outside a Badge (lines, icons, the line of text under a badge), as in the labs /tables, /routes,
 * /invoice, /order. There are no status tokens for these yet (globals.css has Badge tones only), so the palette
 * classes live here, in one place, light + dark. Red goes through `text-destructive`.
 */
export const STATUS_TEXT = {
  muted: 'text-muted-foreground',
  info: 'text-blue-600 dark:text-blue-400',
  success: 'text-green-600 dark:text-green-400',
  successStrong: 'text-green-700 dark:text-green-400',
  warning: 'font-medium text-amber-700 dark:text-amber-400',
  danger: 'font-medium text-destructive',
  oversize: 'text-orange-500',
} as const;

/** Progress lines of the route track. */
export const STATUS_BAR = {
  idle: 'bg-border',
  late: 'bg-destructive/40',
  partial: 'bg-blue-500/50',
  transit: 'bg-blue-500',
  done: 'bg-green-500',
} as const;

export const STATUS_BORDER = {
  idle: 'border-border',
  late: 'border-destructive/40',
  transit: 'border-blue-500',
  done: 'border-green-500',
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
  gain: 'bg-green-500/10 text-green-700 dark:text-green-300',
  loss: 'bg-destructive/10 text-destructive',
} as const;

/** Row tints (DECISIONS §5 Nalozi: subtler; warning = missing vehicle / driver, paid = green). */
export const ROW_TINT = {
  warning: 'bg-destructive/10 hover:bg-destructive/15',
  paid: 'bg-green-500/10 hover:bg-green-500/15',
} as const;

/** Missing vehicle / driver button: dashed red (lab assignment-cell, /order AssignmentPanel). */
export const MISSING_BUTTON =
  'border-dashed border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive dark:border-destructive/50';

/** The next stop on the Ruta: brand tint, and its marker. */
export const NEXT_STOP = {
  row: 'bg-primary/5 dark:bg-primary/25',
  marker: 'border-primary ring-4 ring-primary/15 dark:border-teal-400',
} as const;

/** Links in text (petrol; lighter in dark). */
export const TEXT_LINK = 'font-medium text-primary hover:underline dark:text-teal-300';

/** Ruta: the line after a done stop. */
export const DONE_LINE = 'bg-green-600/60 dark:bg-green-500/60';

/** A route stop on the same day as a new one (Dodijeli vozilo „Isti dan”, lab /assign). */
export const CLASH_ROW = 'bg-amber-50 dark:bg-amber-950/40';

/** The „Danas · 10.11.” line in a vertical route (lab /assign, as Prijevozi's Ruta). */
export const TODAY_LINE = {
  text: 'text-primary dark:text-teal-300',
  rule: 'bg-primary/30 dark:bg-teal-300/30',
} as const;
