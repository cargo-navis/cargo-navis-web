import { useOs } from '@mantine/hooks';
import * as React from 'react';

import { PageTitle } from '@/components/PageTitle';
import { Icon, type IconType } from '@/ui';

/** How long leaving takes: the fades, then the white side growing over the brand panel (lab /login, 2026-11-24). */
const LEAVE_FADE_MS = 250;
const LEAVE_TOTAL_MS = 850;

const leaveFade = (leaving: boolean) =>
  `transition-opacity duration-250 ease-out ${leaving ? 'opacity-0' : 'opacity-100'}`;

/**
 * Resolves when the leave animation of `<AuthLayout leaving>` is over: the fades only below lg (no brand panel) and
 * with reduced motion (the white covers at once).
 */
export function waitForAuthLeave() {
  const grows =
    window.matchMedia('(min-width: 64rem)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return new Promise<void>((resolve) => window.setTimeout(resolve, grows ? LEAVE_TOTAL_MS : LEAVE_FADE_MS));
}

/**
 * Signed-out pages (Prijava, Postavi lozinku). Decided (KAN-55, lab /login, layout B „Brand panel”, 2026-11-19): split
 * screen — left a petrol panel with a faint route pattern, a Sora headline and three lines on what the app does; right
 * the form on the page background, no card. Below lg the panel goes and the logo sits above the form.
 *
 * `leaving` (after a successful Prijava, lab /login 2026-11-24): the form and the panel's content fade out, then the
 * white side grows leftward until it fills the screen; `waitForAuthLeave` says when to open the app.
 */
export function AuthLayout({
  pageTitle,
  leaving = false,
  children,
}: {
  pageTitle: string;
  leaving?: boolean;
  children: React.ReactNode;
}) {
  return (
    <main className="relative grid min-h-dvh bg-background lg:grid-cols-2">
      <PageTitle title={pageTitle} />
      <BrandPanel leaving={leaving} />
      {/* The white side, as one layer over the whole page clipped to the right half; leaving opens the clip leftward
          (clip-path, no layout work per frame). Above the brand panel, below the form. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-10 hidden bg-background transition-[clip-path] delay-150 duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] motion-reduce:transition-none lg:block ${
          leaving ? '[clip-path:inset(0)]' : '[clip-path:inset(0_0_0_50%)]'
        }`}
      />
      <div className="relative z-20 flex flex-col items-center justify-center px-6 py-12">
        <div className={`w-full max-w-sm ${leaveFade(leaving)}`}>
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}

/** Sora title + one muted line under it. */
export function AuthHeader({ title, description }: { title: string; description: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-1.5">
      <h1 className="font-heading text-2xl font-bold tracking-tight">{title}</h1>
      <div className="text-sm text-muted-foreground">{description}</div>
    </div>
  );
}

const SELLING_POINTS: { icon: IconType; text: string }[] = [
  { icon: 'IconMail', text: 'Nalog iz emaila ili PDF-a u minuti' },
  { icon: 'IconRoute', text: 'Ruta svakog vozila, utovari i istovari na jednom mjestu' },
  { icon: 'IconDeviceMobile', text: 'Vozači potvrđuju u aplikaciji, ti vidiš odmah' },
];

function BrandPanel({ leaving }: { leaving: boolean }) {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-primary px-[48px] py-[32px] text-primary-foreground lg:flex">
      <RoutePattern className="pointer-events-none absolute inset-0 size-full text-teal-300" />
      <div className={`relative ${leaveFade(leaving)}`}>
        <Logo inverted />
      </div>
      <div className={`relative flex max-w-md flex-col gap-6 ${leaveFade(leaving)}`}>
        <Headline />
        <ul className="flex flex-col gap-3 text-sm text-primary-foreground/90">
          {SELLING_POINTS.map(({ icon, text }) => (
            <li className="flex items-start gap-3" key={text}>
              <Icon className="mt-0.5 text-teal-300" icon={icon} size="s" />
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </div>
      {/* Fixed height (two tip lines), bottom-aligned: a longer tip grows upward into the empty space instead of
          pushing the headline and the list up (the panel spreads its three blocks with justify-between). */}
      <div className={`relative flex h-10 items-end justify-between gap-8 ${leaveFade(leaving)}`}>
        <span className="shrink-0 text-xs text-primary-foreground/70">
          © {new Date().getFullYear()} Cargo Navis d.o.o.
        </span>
        <TipRotator />
      </div>
    </div>
  );
}

/** One of these per visit, picked after mount (SSR and the first render agree), then faded in. */
const HEADLINES: React.ReactNode[] = [
  'Nalozi, zarada i vozači na jednom mjestu.',
  'Svaki nalog, vozač i euro na jednom mjestu.',
  <>
    Manje poziva,
    <br /> više naloga.
  </>,
];

function Headline() {
  // The index, not the node: a headline can hold markup (a line break).
  const [index, setIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => setIndex(Math.floor(Math.random() * HEADLINES.length)));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <h2
      className={`min-h-[2lh] font-heading text-3xl font-bold tracking-tight transition-opacity duration-300 ${
        index === null ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {HEADLINES[index ?? 0]}
    </h2>
  );
}

/** One-liners about the product, shown one at a time on the brand panel. */
/** `{searchShortcut}` = ⌘K on macOS / iOS, Ctrl K elsewhere (same as the top-bar search field). */
const TIPS = [
  'Pritisni {searchShortcut} i pronađi bilo koji nalog, vozilo ili zaposlenika.',
  'Povuci PDF naloga na Naloge - podatke popunjavamo umjesto tebe.',
  'Klik na red u Nalozima otvara brzi pregled bez napuštanja popisa.',
  'Desni klik na nalog nudi sve radnje i „Otvori u novom tabu”.',
  'Analitikom usporedi prihod po klijentu, vozaču ili vozilu s prethodnim razdobljem.',
  'Jednim klikom obavijesti vozača, utovari mu stižu ravno u aplikaciju.',
  'Vozač u aplikaciji vodi svoju rutu i terete - potvrđuje utovare i istovare, dodaje CMR.',
  'Kartice na Početnoj stranici vode ravno na filtrirane naloge.',
  'Isprave vozača i rokovi vozila upozoravaju 30 dana unaprijed.',
  'Agencijski nalozi pokazuju zaradu odmah uz cijenu.',
  'Svijetli ili tamni izgled biraš u izborniku korisnika.',
];

const TIP_SHOWN_MS = 6500;
const TIP_FADE_MS = 500;
/** After this long on the page (likely not a user yet), the next slot shows the sales nudge, and it stays. */
const NUDGE_AFTER_MS = 45_000;
const DEMO_URL = 'https://www.cargo-navis.com/demo';

/**
 * Rotating „Savjet”: a tip fades + slides in from the right, stays ~6.5 s, then fades + slides back out to the right
 * and the next one comes in. Starts at a random tip (after mount, so SSR and the first render agree). Reduced motion:
 * fade only. After NUDGE_AFTER_MS the next slot is „Ipak te zanima više? Dogovori sastanak ↗” (demo page, new tab)
 * and the rotation stops there, so it can be clicked.
 */
function TipRotator() {
  const os = useOs();
  const searchShortcut = os === 'macos' || os === 'ios' ? '⌘K' : 'Ctrl K';
  const [index, setIndex] = React.useState(0);
  const [visible, setVisible] = React.useState(false);
  const [nudge, setNudge] = React.useState(false);
  const nudgeDue = React.useRef(false);

  React.useEffect(() => {
    const due = window.setTimeout(() => {
      nudgeDue.current = true;
    }, NUDGE_AFTER_MS);
    return () => window.clearTimeout(due);
  }, []);

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIndex(Math.floor(Math.random() * TIPS.length));
      setVisible(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  React.useEffect(() => {
    if (!visible || nudge) return;
    const leave = window.setTimeout(() => setVisible(false), TIP_SHOWN_MS);
    return () => window.clearTimeout(leave);
  }, [visible, index, nudge]);

  React.useEffect(() => {
    if (visible) return;
    let frame = 0;
    const next = window.setTimeout(() => {
      if (nudgeDue.current) setNudge(true);
      else setIndex((current) => (current + 1) % TIPS.length);
      frame = requestAnimationFrame(() => setVisible(true));
    }, TIP_FADE_MS);
    return () => {
      window.clearTimeout(next);
      cancelAnimationFrame(frame);
    };
  }, [visible]);

  return (
    // pr-6 = the slide distance (translate-x-6), so the tip fades out inside the box instead of being cut at its edge;
    // -mr-6 keeps the text on the content edge.
    <div aria-live="polite" className="-mr-6 min-w-0 overflow-hidden pr-6">
      <div
        className={`flex items-start gap-1.5 text-sm text-primary-foreground/90 transition-[opacity,translate] duration-500 ease-out motion-reduce:translate-x-0 ${
          visible ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'
        }`}
      >
        {nudge ? (
          <>
            <span>
              <span
                aria-hidden="true"
                className="text-base pr-[2px] inline-block origin-[70%_70%] motion-safe:animate-[hand-wave_2.4s_ease-in-out_infinite]"
              >
                👋
              </span>{' '}
              Hej, zanima te više?{' '}
              <a
                className="inline-flex items-center gap-0.5 font-semibold underline-offset-4 hover:underline"
                href={DEMO_URL}
                rel="noopener"
                target="_blank"
              >
                Dogovorimo sastanak
                <Icon className="size-4! [&_svg]:size-full!" icon="IconArrowUpRight" size="s" />
              </a>
            </span>
          </>
        ) : (
          <>
            <Icon className="text-primary-foreground" icon="IconBulb" size="m" />
            <span>
              <span className="font-semibold">Savjet: </span>
              {TIPS[index].replace('{searchShortcut}', searchShortcut)}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

/** Same mark as the sidebar header. Also on the 404 outside the app (pages-components/NotFoundPage). */
export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex aspect-square size-8 shrink-0 items-center justify-center rounded-lg bg-white">
        <img alt="" className="size-6" src="/logomark.png" />
      </div>
      <span className={`font-heading text-base font-bold tracking-tight ${inverted ? 'text-primary-foreground' : ''}`}>
        Cargo Navis
      </span>
    </div>
  );
}

const ROUTE_A: [number, number][] = [
  [60, 380],
  [160, 300],
  [250, 330],
  [330, 220],
  [420, 260],
  [520, 150],
  [600, 190],
  [700, 90],
];
const ROUTE_B: [number, number][] = [
  [40, 120],
  [140, 170],
  [230, 120],
  [340, 160],
  [440, 380],
  [560, 330],
  [680, 400],
];

const toPath = (points: [number, number][]) => points.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ');

/** Abstract routes: dashed legs, a dot per utovar / istovar. Decoration only. */
function RoutePattern({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} preserveAspectRatio="xMidYMid slice" viewBox="0 0 760 480">
      <path d={toPath(ROUTE_A)} fill="none" opacity="0.5" stroke="currentColor" strokeDasharray="6 8" strokeWidth="2" />
      <path d={toPath(ROUTE_B)} fill="none" opacity="0.3" stroke="currentColor" strokeDasharray="6 8" strokeWidth="2" />
      {[...ROUTE_A, ...ROUTE_B].map(([x, y], i) => (
        <circle cx={x} cy={y} fill="currentColor" key={i} opacity={i % 3 === 0 ? 0.9 : 0.5} r={i % 3 === 0 ? 6 : 4} />
      ))}
    </svg>
  );
}

const BROKEN_ROUTE: [number, number][] = [
  [40, 420],
  [130, 350],
  [220, 380],
  [300, 290],
  [390, 320],
  [460, 250],
];
const BROKEN_FAINT: [number, number][] = [
  [30, 110],
  [140, 160],
  [240, 100],
  [360, 150],
  [470, 400],
  [600, 350],
  [720, 420],
];
/** Where the last leg stops short, and the pin it was heading for (tip). */
const DEAD_END: [number, number] = [520, 190];
const PIN: [number, number] = [640, 110];

/**
 * RoutePattern's look, but the last leg dead-ends (capped with a bar) before it reaches the pin: the 404 outside the
 * app (lab /lab-404 B „Ruta”). Decoration only.
 */
export function BrokenRoutePattern({ className }: { className?: string }) {
  const [ex, ey] = DEAD_END;
  const [px, py] = PIN;
  const [lx, ly] = BROKEN_ROUTE[BROKEN_ROUTE.length - 1];
  return (
    <svg aria-hidden="true" className={className} preserveAspectRatio="xMidYMid slice" viewBox="0 0 760 480">
      <path
        d={toPath(BROKEN_ROUTE)}
        fill="none"
        opacity="0.5"
        stroke="currentColor"
        strokeDasharray="6 8"
        strokeWidth="2"
      />
      <path
        d={toPath(BROKEN_FAINT)}
        fill="none"
        opacity="0.25"
        stroke="currentColor"
        strokeDasharray="6 8"
        strokeWidth="2"
      />
      <path
        d={`M${lx} ${ly} L${ex} ${ey}`}
        fill="none"
        opacity="0.5"
        stroke="currentColor"
        strokeDasharray="6 8"
        strokeWidth="2"
      />
      <path
        d={`M${ex - 11} ${ey - 11} L${ex + 11} ${ey + 11}`}
        opacity="0.9"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3"
      />
      <path
        d={`M${ex + 18} ${ey - 12} L${px - 16} ${py + 22}`}
        fill="none"
        opacity="0.3"
        stroke="currentColor"
        strokeDasharray="1 9"
        strokeLinecap="round"
        strokeWidth="2"
      />
      {[...BROKEN_ROUTE, ...BROKEN_FAINT].map(([x, y], i) => (
        <circle cx={x} cy={y} fill="currentColor" key={i} opacity={i % 3 === 0 ? 0.9 : 0.5} r={i % 3 === 0 ? 6 : 4} />
      ))}
      {/* Pin (tip at PIN) with a hole */}
      <path
        d={`M${px} ${py} C${px - 4} ${py - 10} ${px - 14} ${py - 16} ${px - 14} ${py - 26} A14 14 0 1 1 ${px + 14} ${py - 26} C${px + 14} ${py - 16} ${px + 4} ${py - 10} ${px} ${py} Z M${px - 5} ${py - 26} a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0 Z`}
        fill="currentColor"
        fillRule="evenodd"
        opacity="0.9"
      />
    </svg>
  );
}
