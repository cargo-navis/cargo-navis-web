import '@mantine/core/styles.css';
import '../styles/globals.css';

import { HeroUIProvider, ToastProvider } from '@heroui/react';
import { MantineProvider } from '@mantine/core';
import type { AppProps } from 'next/app';

import { Head } from '@/components/Head';
import { QueryClientCreator } from '@/lib/components/providers/QueryClientCreator';
import { inter, playfairDisplaySc } from '@/ui/theme/fonts';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <HeroUIProvider>
      <MantineProvider>
        <QueryClientCreator>
          <Head />
          <div className={`${inter.variable} ${playfairDisplaySc.variable} font-display isolate`}>
            <Component {...pageProps} />
          </div>
          <ToastProvider placement="top-center" toastOffset={20} />
        </QueryClientCreator>
      </MantineProvider>
    </HeroUIProvider>
  );
}
