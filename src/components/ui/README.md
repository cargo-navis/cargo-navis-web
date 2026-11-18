# Redesign components (KAN-55)

The decided shadcn components (`base-nova` on Base UI) from the playground, plus the shared pieces and helpers every
page uses. Source of truth: `docs/redesign/DECISIONS.md` and the labs. Files with a „Decided (KAN-55, …)” header carry
the decision in their comment.

## Rules of thumb

- **Tokens, never raw palette classes**: `bg-background`, `bg-card`, `text-muted-foreground`, `border-border`,
  `bg-primary`, `text-destructive` …; domain: `text-utovar` / `text-istovar`, `bg-driver-1…5` (+ `-soft` / `-ink`),
  `bg-agency-*`, `bg-series-*` (src/styles/globals.css). Status pills go through `Badge` tones; status outside a pill
  (a line of text, an icon, a progress line, a row tint) uses `text-success` / `text-warning` / `text-info`,
  `bg-success-dot` / `bg-warning-dot` / `bg-info-dot`, `bg-success-soft` / `bg-warning-soft`. Petrol text that must stay readable in dark
  (links, „Danas”) = `text-brand`; brand fills / lines `bg-brand-solid`; a selected or inviting card `bg-brand-soft`.
- **Icons** only through `@/ui` `Icon` (`<Icon icon="IconTruck" size="s" />`); it renders a `div` around the svg. The
  components' svg selectors reach the svg inside, but the wrapper keeps the `size` you pass, so match it:
  `size="s"` (16px) in buttons, menus, inputs, tabs, sidebar; `size="xs"` (12px) in Badge sm / md and `icon-xs`
  buttons; `size="m"` (20px) in xl / 2xl buttons, Alert, Empty / AlertDialog media tiles. In buttons add
  `data-icon="inline-start"` / `"inline-end"` like the labs. Exact other sizes: `className="size-3.5! [&_svg]:size-full!"`.
- **Old classes**: what is left of the old `@/ui` (Alert, Box, Button, DisplayIf, FlexLayout, Heading, LoadingSpinner,
  Skeleton, Text, TextInput + the `hocs` label wrapper, `ui/theme`) serves only Prijava, Postavi lozinku, the root
  redirect, `LoadingPage` and the Skladište / Kapacitet / Dodjela kamiona placeholders. It runs on legacy tokens
  (`text-legacy-*`, `rounded-legacy-*`, `legacy-red-*` …, `dark-*`, `light-*`, `text-color-*`;
  src/styles/legacy-theme.css). Don't use them in new code; delete them when those pages move over. `Icon` stays.
- Dates via `src/lib/utils/date.ts`, counts via `src/lib/utils/plural.ts`, confirmations via AlertDialog, refetch via
  `useDelayedFlag` + `components/shared/loading`.

## components/ui

| File | What |
|---|---|
| accordion | Accordion / Item / Trigger / Content (chevron icon). |
| alert | Alert (tone `variant`: default, info, success, warning, destructive; `size` sm / default; `icon` = icon name or `false`; `onClose` shows ×), AlertTitle / Description / Action; Banner (one at a time, top of the content card). |
| alert-dialog | Confirm: 448px, ghost Odustani focused, `AlertDialogMedia` red icon tile (destructive only), `AlertDialogAction variant="destructive"`; `size="sm"` for small ones. |
| avatar | Avatar / Image / Fallback / Badge / Group (for drivers use `shared/driver-avatar`). |
| badge | One Badge: `tone` neutral · brand · info · success · warning · danger · category × `look` soft · outline · solid · dot × `size` sm 18 · md 20 · lg 28. |
| breadcrumb | Breadcrumb / List / Item / Link / Page / Separator / Ellipsis. |
| button | Variants default (petrol) · outline · secondary (selected states only) · ghost · destructive (soft red) · link; sizes xs 24 · sm 32 · default 40 · lg 44 · xl 48 · 2xl 56 + `icon-*`; `loading` swaps the leading icon for a spinner and disables. |
| button-group | ButtonGroup / Separator / Text (segmented actions). |
| calendar | react-day-picker 10 calendar (pass `locale={hr}` from `react-day-picker/locale`); use `shared/date-picker` for fields. |
| card | Card / Header / Title / Description / Action / Content / Footer (or `shared/panel` for page panels). |
| chart | Recharts wrapper: ChartContainer (config → `--color-*`), ChartTooltip(+Content), ChartLegend(+Content). Colours: `var(--series-*)`. |
| checkbox | Checkbox (16px, petrol when checked). |
| collapsible | Collapsible / Trigger / Content. |
| combobox | Base UI combobox: Combobox, ComboboxInput (`showClear`), ComboboxContent / List / Item / Empty / Group … (async: `shared/async-combobox`). |
| command | cmdk palette: Command, CommandDialog, Input, List, Empty, Group, Item, Separator, Shortcut (⌘K). |
| context-menu | Right-click menu, same items as dropdown-menu (36px, 44px touch). |
| dialog | Dialog: `size` sm 384 · md 512 (default) · lg 768 · xl 896, top-anchored 12vh, × always, grey footer strip. Dirty forms: `shared/discard-changes`. Phone (<640): floating bottom sheet (`PHONE_SHEET`, also AlertDialog; no swipe). |
| drawer | Base UI bottom sheet (floating, 2rem radius, handle, no backdrop-filter), `showSwipeHandle`, snap points; Header / Title / Description / Footer. |
| dropdown-menu | ⋯ menus: items 36px (44 touch), icon on every item, `variant="destructive"`, checkbox / radio items, submenus. |
| empty | Empty state: Empty / Header / Media (`variant` icon · danger · success) / Title (Sora 16) / Description / Content; min-h 320 in tables. |
| field | Form layout: Field, FieldLabel, FieldDescription, FieldError, FieldGroup, FieldSet, FieldLegend, FieldSeparator, FieldContent, FieldTitle. |
| hover-card | HoverCard / Trigger / Content (preview on hover). |
| input | Input (40px). |
| input-group | InputGroup with Addon (icons, units inside the field), Button, Text, Input, Textarea. |
| item | Item list rows: Item / Media / Content / Title / Description / Actions / Group / Separator / Header / Footer. |
| kbd | Kbd / KbdGroup key hints. |
| label | Label. |
| native-select | NativeSelect / Option / OptGroup (40px, selector icon). |
| pagination | Pages below the table (32px, ellipsis via `paginationPages`), `PaginationCompact` „‹ 3 od 25 ›” for narrow screens. |
| popover | Popover / Trigger / Content (padding 16, gap 12; lists `p-0`) / Header / Title (Sora 16) / Description. |
| progress | Progress / Track / Indicator / Label / Value. |
| radio-group | RadioGroup / RadioGroupItem (radio cards are built from these). |
| scroll-area | ScrollArea / ScrollBar. |
| select | Base UI select: Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectSeparator. |
| separator | Separator. |
| sheet | Side sheet: `size` sm 384 · md 512 · lg 640, floating; Header / Title / Description / Footer (grey strip). Quick look: `modal={false}`. |
| sidebar | App shell sidebar (SidebarProvider, Sidebar, SidebarInset, SidebarMenu / Item / Button …) — used only by the shell (see Shell). |
| skeleton | Skeleton block (first load only). |
| spinner | Spinner (16px span, `className="size-5"` to resize). |
| switch | Switch. |
| table | Table / Header / Body / Footer / Row / Head / Cell / Caption. |
| tabs | Tabs: `variant="line"` page tabs (40px, petrol underline), default = segmented view switch; TabsList / Trigger / Content. |
| textarea | Textarea. |
| toast | `toast.add({ type, title, description })` (or `src/lib/utils/toast` helpers); tinted, 448px, success 4s / error 8s, max 3; `<Toaster>` lives in AppToaster. |
| toggle / toggle-group | Toggle button / segmented ToggleGroup + Item. |
| tooltip | Tooltip / Trigger / Content (300ms delay via the app-wide TooltipProvider, dark in both themes). |

## components/shared (domain pieces used by several pages)

| Import | API |
|---|---|
| `@/components/shared/panel` | `<Panel title? action? className? bodyClassName?>` card with a Sora title row (order, home, assign, employees, partners, fleet, settings). |
| `@/components/shared/country-flag` | `<CountryFlag code="HR" size="xxs\|xs\|s\|m\|l" />` (flag-icons, fixed px). |
| `@/components/shared/country-combobox` | `<CountryCombobox value onValueChange countries? invalid? …>` flag + Croatian name + code. |
| `@/components/shared/async-combobox` | `<AsyncCombobox value onValueChange search={(q) => Promise<T[]>} getKey getLabel renderItem? minChars=2 placeholder noResults? …>` server search as you type. |
| `@/components/shared/date-picker` | `<DatePicker value onChange …>` („7.11.2026.”, × clears; re-clicking the day keeps it), `<YearPicker value onChange>`, `<DateRangePicker value onChange presets? future?>` (reports once both ends are picked; `future` allows days after today) + `DATE_RANGE_PRESETS` (back) / `UPCOMING_DATE_RANGE_PRESETS` (Nalozi). |
| `@/components/shared/driver-avatar` | `<DriverAvatar driverId name size="sm\|md\|lg" />` initials in the driver's tone; red dashed when no driver. |
| `@/components/shared/stop-kind` | `STOP_KIND` (label, icon, text / dot classes), `<StopKindLabel kind="loading\|unloading" done? />` (UTOVAR / ISTOVAR), `<StopKindDot kind done? />`. |
| `@/components/shared/file-row` | `<FileRow name date? icon? onOpen onDownload? onDelete? />` (date gives way to ⬇ 🗑 on hover / focus, both on touch) + `<FileDeleteDialog fileName onConfirm onOpenChange loading? />`. |
| `@/components/shared/invoice-status-badge` | `<InvoiceStatusBadge status isOverdue? daysPastDue? unloadedDaysAgo? size? />` Nefakturiran amber (urgent ≥ 7 d) · Fakturiran blue · Kasni red · Plaćen green; `INVOICE_STATUS_LABEL`, `INVOICE_AFTER_DAYS`. |
| `@/components/shared/expiry-badge` | `<ExpiryBadge date okLabel="U roku\|Valjana" />` Isteklo prije N d / Istječe za N d (30 days ahead) / green dot / „Datum nije upisan”. |
| `@/components/shared/loading` | `<LoadingBar />` (sweeping bar, absolute), `<TableLoadingRow colSpan show />` (bar under a table header), `dimmed(isDimmed)` classes, `<Dimmed when>` wrapper. |
| `@/components/shared/discard-changes` | `useDiscardGuard({ dirty, onClose })` → `{ requestClose, discardDialog }`; `<DiscardChangesDialog>` „Odbaciti promjene?”. |

## Helpers

| Import | API |
|---|---|
| `@/lib/utils/date` | `formatDate(d)` „7.11.2026.”, `formatDateShort(d)` „7.11.”, `formatTime(d)` „08:42”, `formatDateTime(d, { short })`, `daysFromToday(d)`, `formatRelativeDay(d)` danas / sutra / jučer / za 3 dana / prije 2 dana, `formatLate(days, { short })` Kasni 2 dana / Kasni 2 d, `getExpiryState(d)` expired · soon · ok · missing, `formatExpiry(d)`, `EXPIRY_SOON_DAYS` (old exports unchanged). |
| `@/lib/utils/plural` | `plural(n, [one, few, many])`, `pluralCount(n, forms)` „3 istovara”, `pluralForm(n)`, `DAYS`. |
| `@/lib/utils/driverTone` | `driverTone(id)` → 1…5 (FNV-1a), `driverToneClasses(id \| null)` → `{ avatar, bar, text }`, `DRIVER_TONE_CLASSES`, `MISSING_DRIVER_CLASSES`. |
| `@/lib/utils/initials` | `initials('Ivan Horvat')` → „IH”. |
| `@/lib/hooks` | `useDelayedFlag(flag, 300)` (show loading UI only after 300ms), `useIsMobile()` (< 768px). |
| `@/lib/flags` | `useFlag('nalogRouteEntry')` (render, SSR-safe), `isFlagOn(name)` (handlers), `setFlagOverride(name, true \| false \| null)`; env `NEXT_PUBLIC_FF_*`, per-browser `localStorage['ff:<name>']`. |
| `@/lib/utils` | `cn()` (tailwind-merge knows the legacy tokens). |

## Shell (src/components/layout/DashboardLayout)

Every dashboard page wraps itself in the shell (DECISIONS §4, lab /dashboard); the driver portal doesn't use it.

```tsx
import { CRUMBS, DashboardLayout } from '@/components/layout/DashboardLayout';

<DashboardLayout breadcrumbs={[CRUMBS.shipments, { label: shipment.orderNumber }]}>…</DashboardLayout>
```

| Prop | What |
|---|---|
| `breadcrumbs?: Crumb[]` | `{ label, href? }[]`, last = current page. Optional: without it the trail comes from the route (`breadcrumbs.ts`, e.g. `/dashboard/clients/[id]` → Klijenti › Klijent), so pass it only to show names. `CRUMBS.<section>` = linked section crumbs (home, shipments, vehicleStops, fleet, clients, contractors, employees, analytics, settings, search). Hidden below 768px. |
| `contentClassName?` | Classes for the content area (default `p-5 md:p-7`, inside the rounded inset card). |

- Page structure inside: `<h1 className="font-heading text-3xl font-bold tracking-tight">` + content; the window scrolls
  (no inner scroll container). The top bar is sticky, 56px: pinned table headers use
  `sticky top-(--app-header-height,0px)` (the var is set on the inset and on `<html>`).
- Sidebar: `nav.ts` (`NAV`: href, icon, route match, the „Novi nalog” +; `POSITION_LABELS`; `SETTINGS_*_HREF`).
  Collapsed / expanded is kept in the `sidebar_state` cookie; ⌘B toggles it; phones get it as a sheet.
- Top bar: ⌘K (`@/components/GlobalSearch`: palette + `addRecentSearchItem()` for „Nedavno”), bell
  (`@/components/AppMenu`: alerts + notifications; `getAlertItemData` / `getNotificationItemData` in `AppMenu/utils`
  are shared with Početna).
- Postavke: `/dashboard/settings/account` (Moj račun) and `/dashboard/settings/company` (Tvrtka); `/dashboard/settings`,
  `/dashboard/tenant`, `/dashboard/tenant/edit` redirect there (next.config.mjs). Flota: `/dashboard/fleet` (one page,
  type tabs `?vrsta=`), vehicle `/dashboard/fleet/:id`, form `/dashboard/fleet/new?vrsta=…`; link with the helpers in
  `pages-components/Dashboard/FleetPage/fleet.ts` (`vehicleHref`, `newVehicleHref` …). The old per-type URLs redirect.
