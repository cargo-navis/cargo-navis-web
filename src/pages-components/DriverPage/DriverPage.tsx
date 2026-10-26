import NextHead from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { useDriverAccount, useDriverStops } from '@/lib/hooks/api/driver';
import { Box, FlexLayout } from '@/ui';

import { DriverHeader } from './DriverHeader';
import { DriverStatusScreen } from './DriverStatusScreen';
import { type DriverTab, DriverTabs } from './DriverTabs';
import { getDriverPageState } from './getDriverPageState';
import { ShipmentsTab } from './ShipmentsTab';
import { StopsTab } from './StopsTab';
import { useDriverSession } from './useDriverSession';

function getQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export const DriverPage = () => {
  const router = useRouter();
  // `/driver/{token}` comes from a WhatsApp link; `/driver` (installed app start page) has none.
  const linkToken = router.isReady ? (getQueryValue(router.query.token) ?? null) : undefined;
  const focusedStopId = getQueryValue(router.query.vehicleStopId) ?? null;

  const { status, retry } = useDriverSession(linkToken);
  const isSessionReady = status === 'ready';
  const { data: account, error: accountError } = useDriverAccount({ enabled: isSessionReady });
  const { data: stops, error: stopsError, refetch: refetchStops } = useDriverStops({ enabled: isSessionReady });

  const [activeTab, setActiveTab] = useState<DriverTab>('stops');

  const pageState = getDriverPageState({ sessionStatus: status, hasStops: !!stops, accountError, stopsError });

  function renderContent() {
    if (pageState === 'expired') return <DriverStatusScreen variant={linkToken ? 'expired' : 'signed-out'} />;
    if (pageState === 'session-error') return <DriverStatusScreen variant="error" onRetry={retry} />;
    if (pageState === 'stops-error') return <DriverStatusScreen variant="error" onRetry={() => void refetchStops()} />;
    if (!stops) return <DriverStatusScreen variant="loading" />;

    return (
      <>
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
      </NextHead>
      <Box className="min-h-dvh bg-dark-50 dark:bg-light-900">
        {/* Bottom padding keeps the last card clear of the fixed tab bar. */}
        <FlexLayout className="mx-auto min-h-dvh w-full max-w-[480px] flex-col pb-[calc(76px+env(safe-area-inset-bottom))]">
          <DriverHeader driverName={account?.fullName} />
          {renderContent()}
        </FlexLayout>
      </Box>
    </>
  );
};
