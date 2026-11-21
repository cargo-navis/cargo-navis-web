import type { VehicleStop } from '@/lib/api/vehicleStops';
import { useCompleteVehicleStop, useNotifyVehicleStopDriver, useUncompleteVehicleStop } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';

import { isDone } from '../stops';

function errorCode(error: unknown) {
  return (error as { response?: { data?: { errorCode?: string } } })?.response?.data?.errorCode;
}

/** Završeno / Poništi and Obavijesti for one stop, with today's error handling in the new words. */
export function useStopActions(stop: VehicleStop, driverName: string | undefined) {
  const { mutateAsync: complete, isPending: isCompleting } = useCompleteVehicleStop(stop.id);
  const { mutateAsync: uncomplete, isPending: isUncompleting } = useUncompleteVehicleStop(stop.id);
  const { mutateAsync: notify, isPending: isNotifying } = useNotifyVehicleStopDriver(stop.id);

  async function toggleDone() {
    const done = isDone(stop);
    try {
      if (done) {
        await uncomplete();
        showSuccessToast({ title: 'Završeno poništeno' });
      } else {
        await complete();
        showSuccessToast({ title: 'Označeno završenim' });
      }
    } catch (error) {
      const code = errorCode(error);
      if (code === 'CARGO_NOT_YET_LOADED') {
        showErrorToast({
          title: 'Istovar se ne može završiti: teret još nije utovaren',
          description: 'Prvo završi utovar.',
        });
      } else if (code === 'CARGO_STATUS_CHANGED_BY_LATER_STOP') {
        showErrorToast({
          title: 'Ne može se poništiti: teret je već promijenjen na kasnijem utovaru / istovaru',
          description: 'Prvo poništi kasniji.',
        });
      } else {
        showErrorToast({ title: 'Promjena nije spremljena', description: 'Pokušaj ponovno.' });
      }
    }
  }

  async function notifyDriver() {
    try {
      await notify();
      showSuccessToast({ title: driverName ? `${driverName} obaviješten` : 'Vozač obaviješten' });
    } catch {
      showErrorToast({ title: 'Obavijest nije poslana', description: 'Pokušaj ponovno.' });
    }
  }

  return { toggleDone, notifyDriver, isToggling: isCompleting || isUncompleting, isNotifying };
}
