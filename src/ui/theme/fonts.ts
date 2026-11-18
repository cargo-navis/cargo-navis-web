import { Geist, Geist_Mono, Sora } from 'next/font/google';

// KAN-55: Geist body, Sora 700 headings, Geist Mono for registrations (latin-ext for Croatian čćđšž).
// tailwind.config.ts maps `font-display` → Geist and `font-heading` → Sora.

export const geist = Geist({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-geist',
});

export const geistMono = Geist_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-geist-mono',
});

export const sora = Sora({
  subsets: ['latin', 'latin-ext'],
  weight: '700',
  variable: '--font-sora',
});

/** The font CSS variables, set on :root so portals (toasts, dialogs, menus) can use them too. */
export const fontVariablesCss = `:root {
  --font-geist: ${geist.style.fontFamily};
  --font-geist-mono: ${geistMono.style.fontFamily};
  --font-sora: ${sora.style.fontFamily};
}`;
