// Tailwind 4 reads this through `@config` in src/styles/globals.css (compat mode), so the old `@/ui` classes keep
// their custom scales: `colors`, `fontSize`, `borderRadius` and `spacing` replace Tailwind's defaults.
import type { Config } from 'tailwindcss';
import animatePlugin from 'tailwindcss-animate';

import { theme } from './src/ui/theme';

const { colors, fontSize, borderRadius, spacing } = theme;

const config: Config = {
  theme: {
    colors,
    fontSize,
    borderRadius,
    spacing,
    extend: {
      fontFamily: {
        // KAN-55: the old classes pick the new fonts (src/ui/theme/fonts.ts).
        display: ['var(--font-geist)'],
        heading: ['var(--font-sora)'],
      },
      backgroundImage: {
        'sidebar-gradient': 'linear-gradient(45deg, #13949f, 35%, transparent)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [animatePlugin],
};
export default config;
