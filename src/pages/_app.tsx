import '@mantine/core/styles.css';
import '../styles/globals.css';

import { HeroUIProvider, ToastProvider } from '@heroui/react';
import { MantineProvider } from '@mantine/core';
import type { AppProps } from 'next/app';

import { QueryClientCreator } from '@/lib/components/providers/QueryClientCreator';
import { inter, playfairDisplaySc } from '@/ui/theme/fonts';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <HeroUIProvider>
      <MantineProvider>
        <QueryClientCreator>
          <div className={`${inter.variable} ${playfairDisplaySc.variable} font-display`}>
            <Component {...pageProps} />
          </div>
          <ToastProvider placement="top-center" />
        </QueryClientCreator>
      </MantineProvider>
    </HeroUIProvider>
  );
}
