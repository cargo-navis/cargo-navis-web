import type { Config } from "tailwindcss";
import { theme } from './src/ui/theme';

const { fontSize } = theme;

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/ui/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontSize,
    extend: {
      fontFamily: {
        display: ['var(--font-inter)'],
        heading: ['var(--font-playfair)'],
      },
      backgroundImage: {
        "sidebar-gradient": 'linear-gradient(45deg, #923CB5, 35%, black)',
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
