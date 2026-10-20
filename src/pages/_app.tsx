import '@mantine/core/styles.css';
import '../styles/globals.css';

import { HeroUIProvider, ToastProvider } from '@heroui/react';
import { MantineProvider } from '@mantine/core';
import type { AppProps } from 'next/app';

import { Head } from '@/components/Head';
import { QueryClientCreator } from '@/lib/components/providers/QueryClientCreator';
import { inter, playfairDisplaySc } from '@/ui/theme/fonts';

// Driver portal toasts carry actions (undo), so keep them in thumb reach, above its 60px bottom tab bar.
const DRIVER_PORTAL_PATHNAME = '/d/[token]';

export default function App({ Component, pageProps, router }: AppProps) {
  const isDriverPortal = router.pathname === DRIVER_PORTAL_PATHNAME;

  return (
    <HeroUIProvider>
      <MantineProvider>
        <QueryClientCreator>
          <Head />
          <div className={`${inter.variable} ${playfairDisplaySc.variable} font-display isolate`}>
            <Component {...pageProps} />
          </div>
          <ToastProvider
            placement={isDriverPortal ? 'bottom-center' : 'top-center'}
            toastOffset={isDriverPortal ? 76 : 20}
          />
        </QueryClientCreator>
      </MantineProvider>
    </HeroUIProvider>
  );
}
