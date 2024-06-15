import type { Config } from "tailwindcss";
import { theme } from './src/ui/theme';

const { colors, fontSize } = theme;

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/ui/**/*.{ts,tsx}",
  ],
  theme: {
    colors,
    fontSize,
    extend: {
      fontFamily: {
        display: ['var(--font-inter)'],
        heading: ['var(--font-playfair)'],
      },
      backgroundImage: {
        "sidebar-gradient": 'linear-gradient(45deg, #13949f, 35%, transparent)',
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
