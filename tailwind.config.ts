import { heroui } from '@heroui/react';
import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';
import animatePlugin from 'tailwindcss-animate';

import { theme } from './src/ui/theme';

const { colors, fontSize, borderRadius, spacing } = theme;

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages-components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/ui/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
    './node_modules/@heroui/**/node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    colors,
    fontSize,
    borderRadius,
    spacing,
    extend: {
      fontFamily: {
        display: ['var(--font-inter)'],
        heading: ['var(--font-playfair)'],
      },
      backgroundImage: {
        'sidebar-gradient': 'linear-gradient(45deg, #13949f, 35%, transparent)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [
    animatePlugin,
    heroui(),
    plugin(function ({ addUtilities }) {
      const newUtilities = {
        '.text-color-1': {
          '@apply text-dark-800 dark:text-light-50': {},
        },
        '.text-color-2': {
          '@apply text-dark-700 dark:text-light-100': {},
        },
        '.text-color-3': {
          '@apply text-dark-600 dark:text-light-300': {},
        },
        '.text-color-4': {
          '@apply text-dark-500 dark:text-light-300': {},
        },
      };

      addUtilities(newUtilities);
    }),
  ],
};
export default config;
