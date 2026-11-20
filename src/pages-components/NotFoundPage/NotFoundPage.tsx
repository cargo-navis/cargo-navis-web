import * as React from 'react';

import { BrokenRoutePattern, Logo } from '@/components/layout/AuthLayout';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageTitle } from '@/components/PageTitle';
import { PageNotFound, useGoBack } from '@/components/shared/not-found';
import { notFoundContext, PAGE_NOT_FOUND, ROUTE_NOT_FOUND } from '@/components/shared/not-found-copy';
import { Button } from '@/components/ui/button';
import { Icon } from '@/ui';

const noSubscribe = () => () => {};

/**
 * The browser's path; null on the server and while hydrating. pages/404 is static (built once, for every bad URL), so
 * the real path is only known in the browser.
 */
function useBrowserPathname() {
  return React.useSyncExternalStore(
    noSubscribe,
    () => window.location.pathname,
    () => null
  );
}

/**
 * 404 (KAN-55, lab /lab-404, decided 2026-11-20). Decided by the path alone (the session lives in memory, a fresh load
 * can't know it): /dashboard/… gets A „Mirno” inside the shell (signed out, the shell's user query sends them to
 * /login); anything else B „Ruta”, the login brand look. Nothing renders until the path is known, so neither variant
 * flashes. Entity pages show D „Kontekstualno” themselves (components/shared/not-found).
 */
export function NotFoundPage() {
  const pathname = useBrowserPathname();

  return (
    <>
      <PageTitle title={PAGE_NOT_FOUND.crumb} />
      {pathname === null ? null : notFoundContext(pathname) === 'app' ? (
        <DashboardLayout breadcrumbs={[{ label: PAGE_NOT_FOUND.crumb }]}>
          <PageNotFound />
        </DashboardLayout>
      ) : (
        <RouteNotFound />
      )}
    </>
  );
}

/** B „Ruta”: the login's petrol panel, full page, with a route that dead-ends before the pin. */
function RouteNotFound() {
  const goBack = useGoBack(ROUTE_NOT_FOUND.home.href);

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-primary px-6 py-6 text-primary-foreground md:px-12 md:py-8">
      <BrokenRoutePattern className="pointer-events-none absolute inset-0 size-full text-teal-300" />
      <div className="relative">
        <Logo inverted />
      </div>
      <div className="relative flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
        <span className="font-heading text-8xl font-bold tracking-tight tabular-nums">{ROUTE_NOT_FOUND.code}</span>
        <h1 className="font-heading text-2xl font-bold tracking-tight">{ROUTE_NOT_FOUND.title}</h1>
        <p className="max-w-sm text-sm text-primary-foreground/90">{ROUTE_NOT_FOUND.description}</p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {/* A full load, not a client navigation: / is the middleware's redirect (→ /dashboard → /login). */}
          <Button
            className="bg-white text-teal-900 hover:bg-teal-50"
            nativeButton={false}
            render={<a href={ROUTE_NOT_FOUND.home.href} />}
          >
            <Icon data-icon="inline-start" icon="IconHome" size="s" /> {ROUTE_NOT_FOUND.home.label}
          </Button>
          <Button
            className="border-white/30 bg-transparent text-primary-foreground hover:bg-white/10 hover:text-primary-foreground dark:border-white/30 dark:bg-transparent dark:hover:bg-white/10"
            variant="outline"
            onClick={goBack}
          >
            <Icon data-icon="inline-start" icon="IconArrowLeft" size="s" /> {ROUTE_NOT_FOUND.back}
          </Button>
        </div>
      </div>
      <div className="relative text-center text-xs text-primary-foreground/70">
        © {new Date().getFullYear()} Cargo Navis d.o.o.
      </div>
    </main>
  );
}
