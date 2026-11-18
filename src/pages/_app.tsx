// Before any other CSS (Tailwind + tokens).
import '../styles/globals.css';

import type { AppProps } from 'next/app';
import NextHead from 'next/head';
import { ThemeProvider } from 'next-themes';

import { AppToaster } from '@/components/AppToaster';
import { Head } from '@/components/Head';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClientCreator } from '@/lib/components/providers/QueryClientCreator';
import { fontVariablesCss } from '@/ui/theme/fonts';

export default function App({ Component, pageProps }: AppProps) {
  return (
    // Dark mode = the `dark` class on <html>, following the system like before. `color-scheme` stays unset, as before
    // (light scrollbars and form controls in both themes).
    <ThemeProvider attribute="class" defaultTheme="system" enableColorScheme={false} enableSystem>
      <QueryClientCreator>
        {/* 300ms tooltip delay app-wide; once one is open, neighbours open instantly (KAN-55 /overlays/popover). */}
        <TooltipProvider>
          <AppToaster>
            <Head />
            <NextHead>
              <style key="font-variables">{fontVariablesCss}</style>
            </NextHead>
            <div className="font-display isolate">
              <Component {...pageProps} />
            </div>
          </AppToaster>
        </TooltipProvider>
      </QueryClientCreator>
    </ThemeProvider>
  );
}
