import NextHead from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { useDriverAccount, useDriverStops } from '@/lib/hooks/api/driver';
import { Box, FlexLayout } from '@/ui';

import { getDriverPageState } from './getDriverPageState';
import { useDriverSession } from './hooks/useDriverSession';
import { InstallGate } from './install/InstallGate';
import { isIos } from './install/installHint';
import { InstallHintCard } from './install/InstallHintCard';
import { registerDriverServiceWorker } from './install/registerDriverServiceWorker';
import { isInstalledApp, useInstallPrompt } from './install/useInstallPrompt';
import { DriverHeader } from './layout/DriverHeader';
import { DriverStatusScreen } from './layout/DriverStatusScreen';
import { type DriverTab, DriverTabs } from './layout/DriverTabs';
import { ShipmentsTab } from './shipments/ShipmentsTab';
import { StopsTab } from './stops/StopsTab';

function getQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export const DriverPage = () => {
  const router = useRouter();
  // `/driver/{token}` is the link the driver got from their superior; `/driver` (installed app start page) has none.
  const linkToken = router.isReady ? (getQueryValue(router.query.token) ?? null) : undefined;
  const focusedStopId = getQueryValue(router.query.vehicleStopId) ?? null;

  const { status, retry } = useDriverSession(linkToken);
  const isSessionReady = status === 'ready';
  const { data: account, error: accountError } = useDriverAccount({ enabled: isSessionReady });
  const { data: stops, error: stopsError, refetch: refetchStops } = useDriverStops({ enabled: isSessionReady });

  const [activeTab, setActiveTab] = useState<DriverTab>('stops');

  const installPrompt = useInstallPrompt();
  const [installedOn, setInstalledOn] = useState<'ios' | 'android' | null>(null);

  useEffect(() => {
    registerDriverServiceWorker();
    if (isInstalledApp()) {
      setInstalledOn(isIos(navigator.userAgent) ? 'ios' : 'android');
    }
  }, []);

  const pageState = getDriverPageState({ sessionStatus: status, hasStops: !!stops, accountError, stopsError });

  function renderContent() {
    if (pageState === 'expired') {
      return <DriverStatusScreen installedOn={installedOn} variant={linkToken ? 'expired' : 'signed-out'} />;
    }
    if (pageState === 'session-error') return <DriverStatusScreen variant="error" onRetry={retry} />;
    if (pageState === 'stops-error') return <DriverStatusScreen variant="error" onRetry={() => void refetchStops()} />;
    if (!stops) return <DriverStatusScreen variant="loading" />;

    // Phone browser: install first (the session already exists, so iOS copies the cookie into the app).
    if (installPrompt.mode === 'gate') {
      return (
        <InstallGate
          platform={installPrompt.platform}
          onContinueInBrowser={installPrompt.continueInBrowser}
          onInstall={() => void installPrompt.install()}
        />
      );
    }

    return (
      <>
        {installPrompt.mode === 'card' && (
          <InstallHintCard platform={installPrompt.platform} onInstall={() => void installPrompt.install()} />
        )}
        {activeTab === 'stops' ? (
          <StopsTab focusedStopId={focusedStopId} stops={stops} />
        ) : (
          <ShipmentsTab stops={stops} />
        )}
        <DriverTabs activeTab={activeTab} onChange={setActiveTab} />
      </>
    );
  }

  return (
    <>
      <NextHead>
        <title>Moji nalozi · CargoNavis</title>
        <meta content="no-referrer" name="referrer" />
        {/* Installable as "Cargo Navis"; the manifest and service worker are scoped to /driver. */}
        <link href="/driver.webmanifest" rel="manifest" />
        <meta content="#F5F6F7" media="(prefers-color-scheme: light)" name="theme-color" />
        <meta content="#1A1B21" media="(prefers-color-scheme: dark)" name="theme-color" />
        <meta content="yes" name="mobile-web-app-capable" />
        <meta content="yes" name="apple-mobile-web-app-capable" />
        <meta content="Cargo Navis" name="apple-mobile-web-app-title" />
        <meta content="default" name="apple-mobile-web-app-status-bar-style" />
      </NextHead>
      <Box className="min-h-dvh bg-dark-50 dark:bg-light-900">
        {/* Padding keeps content clear of the fixed header (top) and tab bar (bottom). */}
        <FlexLayout className="mx-auto min-h-dvh w-full max-w-[480px] flex-col pb-[calc(76px+env(safe-area-inset-bottom))] pt-[52px]">
          <DriverHeader driverName={account?.fullName} />
          {renderContent()}
        </FlexLayout>
      </Box>
    </>
  );
};
