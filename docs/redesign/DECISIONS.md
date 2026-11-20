# KAN-55 · Redesign decisions

The single source of truth for implementing the redesign. Every decision below was made with the product owner in the
playground (`.context/shadcn-preset`, Next 16 · React 19 · Tailwind 4 · shadcn `base-nova` on Base UI). Each section
names its **lab** (`npm run dev` in the playground, open the path) — when the text and the lab disagree, ask; when the
text is silent, the lab is the reference. Implementation order and approach: `migration-plan.md`.

Status words: **Decided** = build it. **Parked** = ship today's behaviour in the new look, keep the alternative
switchable (see §7). **Later** = not in this redesign.

---

## 1. Foundations

### Colours (lab `/tokens`)
- **Greys: pure neutral** (shadcn neutral). No blue/navy tint (today's `dark-*`/`light-*` palettes go away).
- **Primary = petrol `#0B5560` (teal-800) in light and dark.** Focus ring petrol (dark: teal-500 `#13949F`).
  `#13949F` (brand teal-500) stays for the logo and the „Vlastiti” chart series only — it fails contrast for white text.
- **Dark mode = graphite**: background `#141414`, card / popover / sidebar `#1c1c1c`, muted / accent / secondary
  `#262626`, border white 12 %, text white.
- **Cargo Navis palettes** (teal, orange, green in `src/styles/palette.css`) override Tailwind's ramps of the same name.
- **Named domain tokens** (defined once, light + dark; use the token classes, never raw palette classes):

| Token | Meaning | Light / dark |
|---|---|---|
| `--utovar`, `--utovar-dot` | Utovar label, icon, dot | orange-600 / orange-400 |
| `--istovar`, `--istovar-dot` | Istovar | teal-600 / teal-400 |
| `--agency-50…950` | Agencijski (Badge tone `category`, icon tile, chart) | **violet** (amber is the parked alternative) |
| `--driver-1…5` (+ `-soft` avatar bg, `-ink` avatar text) | One colour per driver | sky, indigo, pink, lime, stone |
| `--series-regular / -agency / -cost / -margin / -loss` | Charts | teal / agency / orange / green / red |

- **Status colours** go through Badge tones only (§3): green = done / paid / valid, blue = in progress / info,
  amber = needs action, red = late / failed / expired / loss, grey = neutral, violet = a kind of thing (Agencijski).
  A status colour never stands alone: always with a word or icon.
- **Utovar orange, istovar teal** everywhere (text, icons, dots). Finished stops turn grey.
- Driver colour = **FNV-1a hash of the employee id → one of the 5 tones**. Collisions are accepted (initials and name
  carry identity). Use the same colour wherever a driver appears (Prijevozi, Dodijeli vozilo, Nalozi Vozač column).

### Type, size, shape (labs `/typography`, `/buttons`, `/forms`)
- Headings **Sora 700, tracking-tight**; body **Geist**; **Geist Mono** for registrations. Playfair and Inter go.
- Base text 14px; on big screens the root scales (107.14 % from 1600px, 114.29 % from 1920px → 15 / 16px). Don't bump
  per-component font sizes; avoid fixed `text-[Npx]`.
- Numbers in columns: `tabular-nums`.
- **Heights:** fields 40px (dense spots `h-8`); buttons xs 24 · sm 32 · **default 40** · lg 44 · xl 48 (driver portal) ·
  2xl 56; icon buttons the same. Menu items 36px (44px on touch).
- **Radius** base 12px (`--radius`): buttons / fields `rounded-lg`, cards / panels `rounded-xl`, driver drawer 2rem.
- **Icons**: Tabler, only through the app's `@/ui` `Icon` (never import `@tabler/icons-react` in app code). Icon next to
  text is start-aligned with a top offset so it sits on the first line.

### Words
- **No „stanica”.** Say utovar / istovar directly („Utovari i istovari”, „3 istovara”, „novi istovar”); a vehicle's
  sequence = **ruta** („Ruta KC 123-AB”); a nalog's from → to = relacija; a single countable noun only if unavoidable =
  mjesto („3 mjesta”).
- **Menadžer** (not Voditelj), **Disponent** (not Dispečer), **Kontraktori** everywhere (not Prijevoznici).
- „Aplikacija za vozače” (not Vozački portal), „Pozivnica za aplikaciju”.
- Croatian agreement checked on every count and status (e.g. Isprave feminine: „1 istekla · 2 istekle · 5 isteklo”;
  Rokovi masculine: „1 istekao · 2 istekla · 5 isteklo”).
- Sentence case for badges and buttons (no UPPERCASE pills). Small uppercase labels only for UTOVAR / ISTOVAR.

### Dates
- **`7.11.2026.`** full, **`7.11.`** short — no leading zeros, no spaces. One formatter for the whole app.
- Relative where it helps: „danas / sutra / za 3 dana”, „Kasni 2 dana”, „Isteklo prije 8 d”, „Istječe za 18 d”.
- Expiry warnings start **30 days ahead** (pages can do this; alerts in the bell need a backend rule).

---

## 2. Interaction rules

- **Buttons**: primary for the main action; **outline** next to it; **ghost** for „Odustani” in dialogs / sheets / bars;
  grey `secondary` only for selected states, never for actions. Destructive = soft red. Labels `font-semibold`.
  Loading = the Button's `loading` prop (spinner replaces the icon, button disabled).
- **Forms**: validate on blur and on submit (not per keystroke). Warnings sit on the label row (no layout shift); an error
  replaces the field's description line. **The primary action is always enabled**: a click marks every problem, says
  „N polja trebaju ispraviti” and jumps to the first. Number fields start empty (no prefilled 0); units inside the field.
- **Page-level forms and flows**: actions in a **sticky bottom bar**, summary on the left, ghost secondary + primary on
  the right.
- **Choices**: a choice that changes saved data or which fields appear → **radio cards** (dot + petrol border/tint + one
  line of meaning). Tabs / segmented only for switching views of the same data.
- **Confirm** (AlertDialog) for irreversible actions or ones that reach a person; nothing for cheap ones (logout, invoice
  status). Replaces all `window.confirm`. The web app has no undo.
- **Loading**: first load = skeleton (tables: rows; detail pages: page-shaped). Refetch = keep the previous data, dim it
  and show a thin bar under the header — only after 300ms (`useDelayedFlag`). Never a full-page spinner.
- **Empty states**: icon tile (no emoji), Sora title, inside the table under its header; with filters → „Očisti filtere”;
  first use → the first action; load error → in place with „Pokušaj ponovno”; no-results echoes the query.
- **Menus vs popovers vs tooltips**: menu = actions, popover = content / picker, tooltip = label for something visible
  (nothing clickable inside, nothing touch-only).
- **Lists**: row click opens; ⋯ menu and right-click give the same actions (+ „Otvori u novom tabu” on right-click).
  Hover-only controls always have a visible touch fallback (`pointer-coarse:`).
- **File rows** (employees, vehicles, nalozi): row click = preview; the date on the right is replaced by ⬇ download +
  🗑 delete on hover / keyboard focus; on touch both show; delete confirms. Attachments icon = 📎 paperclip.

---

## 3. Components (labs `/overlays/*`)

| Component | Decided |
|---|---|
| **Dialog** | sizes sm 384 · **md 512** · lg 768 · xl 896; backdrop black/40 (dark /60), no blur; top-anchored at 12vh, max-h 76dvh; padding 24; title 18 Sora 700; grey footer strip; × always; outside click / Esc / Odustani close when clean, ask „Odbaciti promjene?” when dirty; no dialog on dialog (except that discard confirm); phone (<640) → floating bottom sheet with swipe-to-close (the Drawer; also confirms) |
| **Drawer** | floating bottom sheet (8px inset, 2rem radius), handle 48×6, backdrop 40 % / 60 %, **no backdrop-filter** (iOS), header left + line under (no line when header and body scroll together), title 18 Sora 700, no ×, max-h 80dvh, max-w 480 centred; button layout is up to the content |
| **AlertDialog** | Dialog shell at **448px**, red icon tile on destructive only, text left, ghost Odustani **focused by default**, soft red action, outside click does nothing; type-the-name only for big deletes; phone → drawer |
| **Sheet** | sizes sm 384 · **md 512** · lg 640; floating (8px off edges, 12px corners); backdrop 40 %; header 24px + line; footer = grey strip; title 18 Sora 700. Quick look from a list: `modal={false}`, no backdrop, clicking another row switches; no prev/next arrows, no URL param (for now) |
| **Menus** (dropdown + context) | items 36px (44 touch), 14 regular, icon on every item, grey highlight, ⋯ horizontal trigger, no shortcut hints |
| **Popover / tooltip** | tooltip delay 300ms, 12px regular, arrow, dark in both themes; popover padding 16, gap 12 (lists p-0), title 16 Sora 700, no arrow; phone: list / form popovers → drawer |
| **Toast** | **tinted** by type, dashboard **top-center**, driver bottom-center above the nav, 448px, success / info / warning / error / loading, success 4s, error 8s, × always, max 3 stacked |
| **Alert / Banner** | tint + normal text, 1px border a step darker, default icon per tone, sizes sm + default, actions below the text, × optional; Banner = top of the content card, one at a time |
| **Empty** | 40px icon tile (variants icon / danger / success), title 16 Sora 700, min-h 320; driver a size up |
| **Badge** | one component: `tone` (neutral, brand, info, success, warning, danger, category) × `look` (soft default, outline, solid, dot) × `size` (sm 18, md 20, lg 28 driver); pill shape, sentence case, optional icon, no emoji; vehicle / occupation types = neutral outline |
| **Tabs** | page tabs = line variant 40px, petrol 2px underline, same weight, full-width line; segmented (default variant) 40px for view switches; counts only where something needs attention (solid brand sm); tab in the URL |
| **Pagination** | count above the table (chip row), pages below; numbers with ellipsis; arrows only; current page grey; 32px; scroll to table top on change; narrow → compact „‹ 3 od 25 ›”; page size 10/25/50/100 remembered; page in the URL |
| **⌘K** | today's server search (300ms debounce, min 3 chars, groups + „Prikaži svih N”); before typing: Nedavno + Akcije + Idi na; width 768; key hints footer; top-bar field stays; phone full screen; rows from today's data only; match highlight teal-100 with 2px radius; contractors icon `IconLicense` |
| **Charts** | shadcn charts (Recharts) — Chart.js goes. One axis per chart (two charts instead of dual axes); bars for every time window, ≤24px, 4px rounded top, 2px gap in stacks; current period lighter + „u tijeku”; legend for ≥2 series; Grafikon / Tablica switch per chart; colours validated for colour blindness (no blue next to violet) |

---

## 4. Shell (lab `/dashboard`)

- shadcn Sidebar, collapsible to icons, 40px rows; **inset** layout: content is a rounded card on the frame.
- Frame colour light = **petrol 6 %** (`color-mix(in oklch, #0B5560 6%, white)`, border 14 %); dark = teal-900.
  Active item white with petrol text and icon.
- Top bar: breadcrumb, ⌘K search field, bell popover (alerts + notifications).
- **Company name** at the top of the sidebar (no switcher — one company per user) → Postavke › Tvrtka.
- **User menu** (bottom): email, „Moj račun”, **Izgled** (Sustav / Svijetla / Tamna, segmented, menu stays open), Odjava.
  No „Postavke” item in the sidebar footer.
- Navigation: Početna, Nalozi (+ always-visible sub-items „+ Novi nalog” and „Učitaj nalog” (PDF upload, then Nalozi u
  pripremi) in the normal nav colours; collapsed sidebar: their icons under Nalozi — decided 2026-11-20, replaces the
  hover +), Prijevozi, **Flota (one item)**, Klijenti, Kontraktori, Zaposlenici,
  Analitika.

---

## 5. Pages

### Nalozi (labs `/tables`, `/nalog`, `/routes`, `/invoice`)
- Header: title, „Učitaj nalog” (outline) + „Dodaj nalog” (primary); tabs Nalozi / Nalozi u pripremi (ready drafts count).
- Toolbar filters (status, driver, date range) + „Više filtera”; **always-present chip row** of applied filters with the
  result count on the right („Prikazano 1–10 od 248”). Sorting server-side only.
- Columns: **Nalog** (client 15px medium, `#2041/2026`, violet „Agencijski” + 💼, 📎 count, 💬 note), **Utovar / Istovar**
  route track (per-cargo progress, shared stops drawn once, place labels „🇩🇪 80939 [10.11.]”), **Teret** (LDM first:
  „13,6 LDM” / „9,3 t · 14 pal”, „izvanredni”, oversize ⚠ — locked), **Vozilo / Vozač** (driver icon `IconUser`; missing →
  dashed red „+ Dodijeli vozilo/vozača” popover that assigns in place), **Status fakture** (Nefakturiran amber /
  Fakturiran blue + due / Plaćen green; red only for late payment), **Cijena** (agency: margin pill „+250 € · 18 %”).
- Row tints subtler (warning `bg-destructive/10`, paid `bg-green-500/10`); sticky header; top-aligned cells.
- Row menu: Otvori, Uredi, Kopiraj nalog, Preuzmi PDF ▸ (per document, HR / EN), Status fakture ▸, Izbriši (confirm).

### Nalog detail (lab `/order`) — Decided (second look parked)
- Layout **C with the side column on the left**, the same for agency and own nalozi: summary strip (Ruta, Teret,
  Vozilo / Kontraktor, Cijena with the invoice pill), tabs Pregled / Dokumenti / Napomene / Povijest; left 380px:
  Faktura, Vozilo / Kontraktor, compact Ruta (own nalozi with vehicle stops only — **agency nalozi never show a Ruta**);
  right: Tereti cards.
- Ruta = planned stops **ascending**, next stop highlighted „Sljedeće” with „✓ Potvrdi utovar/istovar”; done stops quieter
  with ✓ + who („Potvrdio vozač” / „Označio …”); undo via ⋯ („Označi nedovršenom”, disabled with reason when blocked);
  pending label relative („danas / sutra / za 3 dana”, „Kasni 2 dana”). Povijest = log, newest first.
- Invoice: badge + „Promijeni ▾” menu.

### Nalog form (lab `/nalog-form`)
- Modes: new, copy, from draft (AI), edit. Left column: Nalog (Klijent combobox + „Novi klijent”, Cijena €, Vanjska
  referenca, **„Tko vozi?” radio cards** Vlastiti prijevoz / Agencijski → kontraktor, cijena kontraktora, live RUC +
  marža), Napomene (Interna „Samo za vas”, Vanjska „Ispisuje se na PDF nalogu”).
- Tereti: cargo type radio cards **„Palete” / „Izvanredni teret”**; LDM computed („izračunato”) until typed; units in
  fields.
- **Cargo + utovar / istovar entry: Parked** → ship **per teret with stop details in a dialog** (today's structure);
  alternative „Ruta pa tereti” (route-first + address search over earlier stops) stays in the lab and behind flag
  `nalogRouteEntry`.
- From draft: info banner with the file, client suggestion banner, **✦ on AI-filled fields** until touched.
- Sticky bottom bar: „2 tereta · 12,5 LDM · 15.500 kg · 1.850 €”, Odustani, Kreiraj nalog / Spremi promjene.
- After creating an own nalog → **Dodijeli vozilo page** (Korak 2).

### Dodijeli vozilo (lab `/assign`) — a page, not a modal
- `/dashboard/shipments/[id]/assign`; after „Kreiraj nalog” shows „Nalog kreiran · Korak 2 od 2” and „Preskoči”; from
  Nalog detail „Odustani”. The Nalozi table keeps its quick popover.
- Left: nalog summary, **„Utovari i istovari”** with prefilled editable dates. Right: **vehicle dropdown** (options say
  where it will be on the loading day „11.11. u: Ljubljana” and amber „Već ima istovar 11.11. · Wien”; vehicles without
  conflicts first), then **„Dodijeli vozača” / „Promijeni vozača”** (same searchable select; **required with red \*** when
  the vehicle has no driver; „Samo za utovare i istovare ovog naloga; X ostaje na ostalima” + „Vrati X”), then the
  selected vehicle's **vertical timeline** („Ruta KC 123-AB”; last 3 done + planned + new stops by date; „Danas · 10.11.”
  label + line; new stops = pulsing dot in the kind colour + „Novo · #2057”; same-day clash marked „Isti dan”).
- No „Slobodan / Zauzet” pill. Sticky bottom bar: vehicle · driver, ☑ „Obavijesti vozača (X)”, Preskoči / Odustani,
  „Dodijeli KC 123-AB”.
- Capacity check and trailer display: Later.

### Prijevozi (lab `/transports`)
- List with a **Tablica · Tjedan · Kao danas** switch (default Tablica):
  - Tablica: Vozilo / vozač · Sada · Sljedeće · Plan („još 2 · do 13.11.”) · Treba pažnju (Bez vozača, N bez datuma,
    N nije obaviješteno).
  - Tjedan: vehicles × Pon–Ned + „Bez datuma”, chips with kind dot, today tinted, ‹ › week.
  - Kao danas: today's horizontal timeline per vehicle, restyled, place + date under each point.
  - Search by driver / registration, Disponent filter (remembered).
- Vehicle page „Ruta KC 123-AB”: **today's order (newest first)** (chronological variant kept in code);
  **driver runs = avatar + side bar in the driver's colour**, name + „Promijeni” (red dashed „Bez vozača” + „Dodijeli
  vozača” when none).
- Each card: date (click = inline date edit), UTOVAR / ISTOVAR in colour, „Sljedeće” + „Završeno” on the next stop,
  place · company, street, tereti per nalog (#nalog links), 📎, notification state („Obaviješten 8.11. 16:05” / amber
  „Nije obaviješten · Obavijesti”). ⋯: Uredi (side sheet md), Dodaj prije / poslije, Obavijesti, **Promijeni vozača od
  ovdje**, Označi završenim / Poništi, Obriši (confirm). Drag handle on hover (only within the same date, as the backend).
- **Promijeni vozača** popover: new driver, scope radio „Samo oni koje vozi Ivan Horvat (N)” / „Svi nezavršeni na ovom
  vozilu (N)”, a preview list of exactly the affected stops, ☑ Obavijesti novog vozača. **Finished stops never change.**

### Klijenti + Kontraktori (lab `/partners`)
- List: no avatar, place under the name, ⋯ + right-click (Otvori, Uredi, Novi nalog, Kopiraj porezni broj, Izbriši),
  search over name / place / tax id / email.
- Detail: header with Uredi / Novi nalog (contractor: Novi agencijski nalog) / ⋯, money strip, left Podaci, right their
  nalozi with invoice pills. Form: VIES lookup above an always-visible form; contractor: valuta required.

### Zaposlenici (lab `/employees`)
- List: small neutral initials, tabs Svi · Vozači · Ured, deactivated hidden behind „Prikaži deaktivirane” (dimmed),
  columns Kategorije („Highest, rest muted”: brand „CE” + muted „+ B, C” + amber ADR), **Isprave** (feminine values),
  **Aplikacija** (only „WhatsApp spojen” until the API knows about the driver app), sortable.
- Detail: banner of expired / soon, „Isprave i rokovi” table, Kontakt (resend invite when no password set), Aplikacija za
  vozače, Osobni podaci, Datoteke, Zadnji nalozi (5). Deaktiviraj = confirm, no reactivation.
- Form: driver fields only for drivers. First use: you („Ti”) + „Dodaj prve vozače” (Dodaj vozača / Dodaj nekoga iz ureda).

### Flota (lab `/fleet`)
- **One page with type tabs** Sve · Tegljači · Poluprikolice · Solo kamioni · Kombiji (+ counts), `?vrsta=…`; replaces
  Pregled flote and 4 sub-pages; old URLs redirect. Columns per tab, „Rokovi” column (masculine values), Croatian load
  types, search incl. VIN and registration without spaces, „Dodaj vozilo ▾”.
- Detail: spec chips in the header, Rokovi table, Datoteke, Zadnji prijevozi (motor vehicles). Form: Vrsta radio at the
  top (new only), brand combobox (suggestions + any), empty numbers, units in fields.

### Početna (lab `/home`)
- 5 shortcut tiles (Danas utovara, Danas istovara, Nefakturirano, Dospjelo neplaćeno, Nalozi · zadnjih 7 dana with a
  sparkline), main „Danas” list (finished dimmed at the end, „+ Dodijeli vozilo”), right „Treba pažnju” + „Aktivnost”.
  The „Ovaj tjedan” card goes.

### Analitika (lab `/analytics`)
- Tabs Ukupno · Vlastiti prijevoz · Agencijski nalozi; filter row (period presets, Dan / Tjedan / Mjesec / Godina,
  klijent or vozač / vozilo) in the URL; tiles with change vs the previous period; two charts per tab (Nalozi, Prihod;
  agency: Prihod i trošak + RUC with zero line); tables with share bar, rows open the entity; „Kontraktori”.

### Pretraga (lab `/search`)
- Title „Pretraga za „x”” (query from the top-bar search; no field on the page), tabs Sve + categories with counts
  (Sve = top 5 per category + „Prikaži svih N …”), ⌘K rows, 20 per page.

### Postavke (lab `/settings`)
- One page with a side list **Moj račun · Tvrtka**; URLs `/dashboard/settings/account|company`, old URLs redirect.
- Moj račun: read-only profile + link to own Zaposlenici page, password with a live checklist, Ovaj uređaj (Izgled —
  also in the user menu, notifications state).
- Tvrtka: always-editable form + save bar when changed, logo instant, live PDF preview, osiguranje date + state.

### Driver portal (lab `/driver`)
- Buttons xl 48px, Badge lg, toasts bottom-center, drawers as §3 (no backdrop-filter), utovar orange / istovar teal,
  📎 paperclip for documents (file-type icons and the camera on „Dodaj dokument” stay), Sora fallback to Geist 700 on
  long place names.

---

## 6. Backend notes

- `POST /api/vehicle-stops/assign-shipment` accepts optional **`driverId`** (KAN-145); develop's web client already
  sends it (`src/lib/api/vehicleStops.ts`, `SelectDriverDialog`) — the Dodijeli vozilo page replaces that dialog with its
  inline driver field. Without it, new stops inherit driver, trailer and disponent from the
  **last stop in the vehicle's route order** (by date), not from the last assigned nalog.
- Driver change on many stops = one `updateVehicleStop` per stop + notify per stop (a bulk endpoint can come later).
- Needs backend before it can ship: contractor's nalozi filter (`transportContractorId`), client € totals, a full
  address book (route-first entry), a vehicle-level default driver, driver-app login state, 30-day alert rule.

## 6b. Features on develop newer than the labs

Built on develop after the labs were made (13.11.2026) — carry them into the redesign in the new look, following the
rules above (no lab exists):
- **KAN-112** client notification contacts (list on the client page: email, „Automatski” switch, delete) and shipment
  recipients (field in the Nalog form prefilled with the client's automatic contacts; emails shown / editable on the
  Nalog page) → PR 3 (Nalog detail), PR 4 (form), PR 6 (client page).
- **KAN-145** driver picker when assigning a vehicle without a driver → superseded by the Dodijeli vozilo page (PR 4).
- Before each PR: `git log --since=2026-11-13 develop -- <the PR's folders>` to catch anything newer.

## 7. Parked (ship today's behaviour, keep the switch)

| Parked | Ships as | Alternative kept |
|---|---|---|
| Nalog form cargo / stop entry | per teret + dialog | „Ruta pa tereti” — lab + flag `nalogRouteEntry` |
| Nalog detail second look | layout C (above) | lab `/order` (ideas D–F) |
| Agency colour | violet | amber via `--agency-*` (lab header switch) |
| Document preview window | today's (open inline in a new tab) | — |
| Bulk „Obavijesti vozača o novom” | per stop | — |
| Vehicle default driver | inherited + picked on Dodijeli vozilo | backend field |

Flags: `lib/flags.ts` — `NEXT_PUBLIC_FF_*` env, overridable per browser in `localStorage`.
