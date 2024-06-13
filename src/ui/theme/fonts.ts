import { Inter, Playfair_Display_SC } from 'next/font/google';

export const inter = Inter({
  subsets: ["latin"],
  variable: '--font-inter',
});

export const playfairDisplaySc = Playfair_Display_SC({
  subsets: ['latin'],
  weight: "700",
  variable: '--font-playfair',
});