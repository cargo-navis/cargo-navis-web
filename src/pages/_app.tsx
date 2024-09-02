import '@mantine/core/styles.css';
import "../styles/globals.css";

import { SessionProvider } from 'next-auth/react';
import { MantineProvider } from '@mantine/core';
import { inter, playfairDisplaySc } from '@/ui/theme/fonts';

import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider>
      <SessionProvider session={pageProps.session}>
        <div className={`${inter.variable} ${playfairDisplaySc.variable} font-display`}>
          <Component {...pageProps} />
        </div>
      </SessionProvider>
    </MantineProvider>
  );
}
