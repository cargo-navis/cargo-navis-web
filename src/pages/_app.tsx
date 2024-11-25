import '@mantine/core/styles.css';
import '../styles/globals.css';

import { inter, playfairDisplaySc } from '@/ui/theme/fonts';
import { MantineProvider } from '@mantine/core';

import { QueryClientCreator } from '@/lib/components/providers/QueryClientCreator';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MantineProvider>
      <QueryClientCreator>
        <div className={`${inter.variable} ${playfairDisplaySc.variable} font-display`}>
          <Component {...pageProps} />
        </div>
      </QueryClientCreator>
    </MantineProvider>
  );
}
