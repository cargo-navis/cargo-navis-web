# KAN-55 · Redesign migration plan

Status: agreed (2026-11-18). Branch: `KAN-55/redesign` (base `develop`). Agents and subagents working on this plan may
commit and merge locally without asking (see `orchestrator-prompt.md`); pushing and PRs stay with the user.

## 1. What we're migrating to

The target is the **playground**: `.context/shadcn-preset` (Next 16 · React 19 · Tailwind 4 · shadcn `base-nova` on
Base UI · Tabler icons). Every page has a lab with the decisions baked in; `npm run dev` there and open the page.

| Area | Lab | Status |
|---|---|---|
| Shell (sidebar, top bar, ⌘K, bell, user menu, Izgled) | `/dashboard` | decided |
| Components: dialog, drawer, confirm, sheet, menus, popover, tooltip, toast, alert, empty, loading, badge, tabs, pagination, ⌘K | `/overlays/*` | decided |
| Buttons, typography, forms, date fields, selects | `/buttons`, `/typography`, `/forms` | decided |
| Nalozi table (Nalog / route / cargo / invoice columns, filters, row menu, states) | `/tables`, `/nalog`, `/routes`, `/invoice` | decided |
| Nalog detail | `/order` | decided (layout C, side column left) |
| Nalog form (new / from draft / edit) | `/nalog-form` | decided except cargo entry (parked, see §3) |
| Dodijeli vozilo (page, was a modal) | `/assign` | decided |
| Prijevozi (list: Tablica · Tjedan · Kao danas; vehicle ruta) | `/transports` | decided |
| Klijenti + Kontraktori | `/partners` | decided |
| Zaposlenici (+ first use) | `/employees` | decided |
| Flota (one page, type tabs) | `/fleet` | decided |
| Početna | `/home` | decided |
| Analitika (Recharts) | `/analytics` | decided (agency colour switch kept) |
| Pretraga | `/search` | decided |
| Postavke (Moj račun, Tvrtka) | `/settings` | decided |
| Driver portal (PWA) | `/driver` | decided |
| Colours & tokens, today → new class map | `/tokens` | decided |

Sources of truth, in this order: **`docs/redesign/DECISIONS.md`** (to write first, §6), the lab page, the lab file's
header comment („DECIDED …”).

## 2. Rules that apply everywhere

- **Tokens, not colours.** shadcn surface/text tokens (pure neutral greys, petrol `--primary #0B5560` in both themes,
  graphite dark `#141414 / #1c1c1c / #262626`) + named domain tokens: `--utovar` (orange), `--istovar` (teal),
  `--agency-*` (violet), `--driver-1…5`, `--series-*`. Status = Badge `tone × look × size`; a status colour never stands
  alone (icon or word).
- **Icons** only through `@/ui` `Icon` (never import `@tabler/icons-react` in app code; don't change `Icon.tsx`).
- **Type & size.** Sora 700 headings (tracking-tight), Geist body, Geist Mono for registrations; fields and default
  buttons 40px; menu items 36px (44 touch); radius base 12px.
- **Words.** No „stanica” → utovar / istovar, „ruta” for a vehicle's sequence. Menadžer, Disponent, Kontraktori.
  Croatian agreement checked on every count.
- **Dates.** `7.11.2026.` / `7.11.` — no leading zeros, no spaces (one formatter in `lib/utils/date`).
- **Forms.** Validation on blur + submit (not per keystroke); warnings on the label row (no layout shift); the primary
  action is always enabled and jumps to the first error; page-level forms put actions in a sticky bottom bar, primary
  on the right. A choice that changes data → radio cards; Tabs/segmented only for switching views.
- **Confirmations** = AlertDialog (Cancel focused). No `window.confirm`.
- **Loading** = keep previous data, dim after 300ms + top bar; skeleton only on first load.

## 3. Parked decisions → ship the current implementation, keep the switch

Rule (user, 2026-11-18): where a decision is parked, build what the app does today (in the new look); keep the
alternative switchable — in the playground always, and in the app behind a flag where it's cheap.

| Parked | Ship | Switch |
|---|---|---|
| Nalog form: cargo + utovar/istovar entry (route-first A + C vs per teret) | per teret, stop details in a dialog (today's structure, new components) | playground `/nalog-form`. In the app: optional flag `nalogRouteEntry` (follow-up PR, needs the A+C form + an address-book source) |
| Nalog detail: second look | decided layout C | playground `/order` |
| Agency colour (violet vs amber) | violet | one CSS variable set (`--agency-*`); playground header switch |
| Document preview window | today's behaviour (open inline in a new tab) | — |
| Bulk „Obavijesti vozača o novom” | per stop (today) | — |
| Vehicle default driver | inherited from the route's last stop (today) + driver picked on Dodijeli vozilo | backend field later |

Flags: one tiny helper `lib/flags.ts` (`NEXT_PUBLIC_FF_*` env, overridable per browser via `localStorage`), so a parked
alternative can ship dark and be switched without a deploy.

## 4. PR 1 · Platform first (no visual change)

Today: Next 14.2 (pages router) · React 18 · Tailwind 3.4 with a fully custom `theme` · HeroUI 2.7 (3 files: toast,
driver `CompleteStopButton`, provider) · Radix (dialog, dropdown, popover, collapsible, slot) · vaul · Chart.js ·
reui timeline.

1. **React 19 + Next 15/16** (pages router stays; no App Router move). shadcn base-nova components pass `ref` as a prop
   (React 19).
2. **Tailwind 4** via `@tailwindcss/postcss`; keep today's theme working through `@config "../../tailwind.config.ts"`
   (compat) so old `@/ui` classes keep rendering; add the new `@theme` + tokens next to it.
3. **HeroUI out** (toast → shadcn/Base UI toast, the driver button → `Button`), which also unblocks the vaul → Base UI
   drawer move (see memory „Drawer Base UI migration”).
4. `next-themes` (class strategy; today dark follows `prefers-color-scheme` only), fonts via `next/font` (Sora, Geist,
   Geist Mono; drop Playfair, Inter).

Verify: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, then click through every page in light and
dark (nothing should look different yet). Risk: Next/React upgrade breaking libraries (react-hook-form, tanstack, dnd-kit,
reui) — upgrade one at a time, fix, then move on.

## 5. Then by domain (9 PRs in total, including PR 1 above)

New components go to `src/components/ui` (copied from the playground's decided `components/ui/*`, each with its
„Decided (KAN-55, …)” header). Old `@/ui` pieces are deleted in the PR that removes their last user. Every PR: replace
raw palette classes with tokens (map in `/tokens` §5), Croatian copy as in the lab, light + dark, phone width where the
page is used on phones.

| # | PR (domain) | Scope | Notes / backend |
|---|---|---|---|
| 1 | **Platform** | §4: React 19 + Next 15/16, Tailwind 4 (compat), HeroUI out, next-themes, fonts | no visual change |
| 2 | **Foundations + shell** | `components/ui/*` (decided), tokens in `globals.css`, Toaster, `useDelayedFlag`, date formatter, `lib/flags.ts`; sidebar (inset, petrol 6 % frame), top bar (breadcrumb, ⌘K, bell), user menu (Moj račun, Izgled, Odjava), company → Tvrtka, Flota single item; **Pretraga** page; **Postavke** (Moj račun, Tvrtka + redirects) | ⌘K + Pretraga share today's `/api/search` |
| 3 | **Nalozi** | list (columns, filter chip row, row / context menu, states, pagination, drafts tab, quick assign popover) + **Nalog detail** (layout C, Ruta, panels) | agency: never a Ruta |
| 4 | **Novi nalog → vozilo** | Nalog form (new / copy / draft / edit, today's per-teret entry in the new look, „Tko vozi?”, ✦ AI, sticky bar) + **Dodijeli vozilo page** (replaces the modal; dropdown + vertical timeline, driver field, notify) | `driverId` already sent (KAN-145 on develop); page replaces `SelectDriverDialog`; KAN-112 recipients field; flag `nalogRouteEntry` later |
| 5 | **Prijevozi** | list (Tablica · Tjedan · Kao danas), vehicle ruta, driver runs + colours, Promijeni vozača (+ „od ovdje”), side-sheet edit, inline date | `updateVehicleStop` per stop |
| 6 | **Partneri i ljudi** | Klijenti + Kontraktori (list, detail, VIES form) + Zaposlenici (list, detail, form, first use, file rows) | client € totals + contractor nalozi filter need backend (left out) |
| 7 | **Flota** | one page with type tabs, detail, form; redirects from `/fleet/trucks…` | — |
| 8 | **Pregled** | Početna (tiles + 7-day pulse, Danas, Treba pažnju, Aktivnost) + Analitika (Recharts, split charts, deltas, tables); Chart.js removed | — |
| 9 | **Vozači + čišćenje** | driver portal (decided driver labs) + final cleanup: unused `@/ui`, Radix, vaul, Chart.js leftovers, reui, `tailwind.config.ts` compat, old fonts / theme; sweep „stanica”, date formats, raw palette classes | PWA caveats in memory |

Order rationale: platform → foundations + shell (every page sits in it) → the daily path (Nalozi → creating and assigning
→ Prijevozi) → the rest. Once 1–2 are merged, 3–8 can run in parallel; 9 goes last.

## 6. Before the first code PR

1. Write `docs/redesign/DECISIONS.md` — human-readable, per page and per component, from the memory file
   `shadcn-redesign-decisions.md` + lab headers. Agents implement from it.
2. Copy the playground somewhere safe (it lives in a gitignored `.context` folder of one Conductor workspace): its own
   private repo, or a `redesign-playground` folder on a branch.
3. Agree the 9 domain PRs and that each PR links its labs.

## 7. Verification per PR

typecheck · lint · vitest · build · manual pass against the lab (light, dark, phone width where relevant) · no raw
palette classes left in touched files · Croatian copy check · screenshots in the PR.

## 8. Risks

- Next/React/Tailwind upgrade in one go → do §4 as its own PR, before any visual change.
- Long-lived branch drifting from `develop` → merge page PRs as they're ready (behind the new shell), rebase often.
- Parked decisions creeping back in → §3 table is the answer; changes go through the lab first.
- Backend-dependent bits shipped as if done → the labs mark them; keep them out or behind a flag.
- Features merged to develop after the labs (KAN-112 notification contacts / recipients, KAN-145 driver picker) → see
  DECISIONS.md §6b; check `git log --since=2026-11-13 develop` per PR.
