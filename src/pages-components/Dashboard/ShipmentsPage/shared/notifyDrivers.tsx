/**
 * „Obavijesti vozača” for one nalog (today's NotifyDriversButton flow): notifies the drivers of its unfinished stops;
 * when they were already notified it asks first („Obavijestiti ponovno?”). One code path for the Nalog detail's header,
 * the quick look's Vozač row and the Nalozi row menu (⋯ / right-click).
 */

import * as React from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Shipment } from '@/lib/api';
import { useNotifyShipmentDrivers } from '@/lib/hooks';
import { formatDateTime } from '@/lib/utils/date';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { isStopCompleted } from '@/lib/utils/vehicleStops';
import { Icon } from '@/ui';

import { getDriversNotifiedToast } from '../driverNotifications';
import { useLookups } from './lookups';

export function useNotifyDrivers(shipment: Shipment, clientName?: string) {
  const { employeesById } = useLookups();
  const { mutateAsync: notifyDrivers, isPending } = useNotifyShipmentDrivers(shipment.id);
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const activeStops = (shipment.vehicleStops ?? []).filter((stop) => !isStopCompleted(stop));
  const driverIds = [...new Set(activeStops.map((stop) => stop.driverId).filter((id): id is string => !!id))];
  const driverCount = driverIds.length;
  const driverNames = driverIds.flatMap((id) => employeesById.get(id)?.fullName ?? []);
  const lastSentAt = activeStops
    .map((stop) => stop.messageSentAt)
    .filter((sentAt): sentAt is string => !!sentAt)
    .sort()
    .at(-1);

  async function notify() {
    setConfirmOpen(false);
    try {
      const notifiedStops = await notifyDrivers();
      if (notifiedStops.length === 0) {
        showErrorToast({ title: 'Obavijest nije poslana', description: 'Nijedan vozač nije primio poruku.' });
        return;
      }
      showSuccessToast(
        getDriversNotifiedToast({
          notifiedStops,
          employees: [...employeesById.values()],
          clientName,
          orderNumber: shipment.orderNumber,
        })
      );
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Obavijest nije poslana', description: 'Pokušaj ponovno.' });
    }
  }

  /** Notify now, or ask first when they were already notified. */
  const request = () => (lastSentAt ? setConfirmOpen(true) : void notify());

  const dialog = (
    <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Obavijestiti ponovno?</AlertDialogTitle>
          <AlertDialogDescription>
            {driverCount > 1 ? 'Vozači su već obaviješteni' : 'Vozač je već obaviješten'}
            {lastSentAt && ` (${formatDateTime(lastSentAt, { short: true })})`}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Odustani</AlertDialogCancel>
          <AlertDialogAction onClick={() => void notify()}>
            <Icon data-icon="inline-start" icon="IconBell" size="s" /> Pošalji ponovno
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return {
    /** Unfinished stops on a vehicle: something to notify about. */
    hasStops: activeStops.length > 0,
    driverCount,
    /** Full names of those drivers (the menu shows them under the item). */
    driverNames,
    lastSentAt,
    /** „Obavijesti vozača” / „Obavijesti vozače”. */
    label: driverCount > 1 ? 'Obavijesti vozače' : 'Obavijesti vozača',
    isPending,
    request,
    dialog,
  };
}
