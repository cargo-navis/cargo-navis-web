import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoadingPage } from '@/lib/components/LoadingPage';
import { useVehicleStop } from '@/lib/hooks/api/vehicleStops';
import { Text } from '@/ui';

/**
 * Opens a single stop when only its id is known (e.g. from a notification): looks up its vehicle and replaces itself
 * with that vehicle's stops page, highlighting the stop.
 */
export const VehicleStopRedirectPage = () => {
  const router = useRouter();
  const stopId = typeof router.query.stopId === 'string' ? router.query.stopId : undefined;
  const { data: stop, isError } = useVehicleStop(stopId);

  useEffect(() => {
    if (!stop) return;
    void router.replace(`/dashboard/vehicle-stops/${stop.vehicleId}?highlight=${stop.id}`);
  }, [stop, router]);

  return (
    <DashboardLayout>
      {isError ? (
        <Text as="p" className="py-6" color="text-color-3">
          Postaja nije pronađena.
        </Text>
      ) : (
        <LoadingPage />
      )}
    </DashboardLayout>
  );
};
