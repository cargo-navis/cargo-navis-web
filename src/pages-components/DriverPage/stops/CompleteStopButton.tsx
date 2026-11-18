import type { AxiosError } from 'axios';

import { Button } from '@/components/ui/button';
import type { DriverStop } from '@/lib/api/driver';
import { useCompleteDriverStop, useDriverStops, useUncompleteDriverStop } from '@/lib/hooks/api/driver';
import { closeToast, showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Icon } from '@/ui';

import {
  getNotYetLoadedCargos,
  getPendingLoadingStops,
  getStopKindLabels,
  getStopShortName,
  getStopToastDescription,
} from '../utils';

export const UNDO_TIMEOUT_MS = 5_000;

// The backend's guards on cargo order (see ErrorCode in the API).
function getErrorCode(error: unknown) {
  return (error as AxiosError<{ errorCode?: string }>)?.response?.data?.errorCode;
}

interface CompleteStopButtonProps {
  stop: DriverStop;
  /** Called once the confirmation is saved, e.g. to close the stop drawer (the undo toast stays). */
  onCompleted?(): void;
}

export const CompleteStopButton: React.FC<CompleteStopButtonProps> = ({ stop, onCompleted }) => {
  const { mutateAsync: completeStop, isPending } = useCompleteDriverStop();
  const { mutateAsync: uncompleteStop } = useUncompleteDriverStop();
  // Reads the already loaded route (DriverPage fetches it); `stop` can be cut down to one order in the Nalozi tab.
  const { data: stops = [], refetch: refetchStops } = useDriverStops({ enabled: false });

  // A confirmed stop shows its time in green instead (the section titles, or the order sheet's timeline).
  if (stop.completedAt) return null;

  const labels = getStopKindLabels(stop);
  // Cargo can't be unloaded before it's loaded; confirming always covers the whole stop.
  const fullStop = stops.find((other) => other.id === stop.id) ?? stop;
  const notYetLoadedCargos = getNotYetLoadedCargos(fullStop);
  const isBlocked = notYetLoadedCargos.length > 0;

  async function handleUndo(confirmToastKey: string | null) {
    if (confirmToastKey) closeToast(confirmToastKey);
    try {
      await uncompleteStop({ stopId: stop.id });
      showSuccessToast({ title: 'Potvrda poništena', description: getStopToastDescription(stop) });
    } catch (error) {
      if (getErrorCode(error) === 'CARGO_STATUS_CHANGED_BY_LATER_STOP') {
        showErrorToast({ title: 'Utovar se ne može poništiti.', description: 'Istovar ovog tereta je već potvrđen.' });
        return;
      }
      showErrorToast({ title: 'Poništavanje nije uspjelo.' });
    }
  }

  // The button shows the pending state while saving; the undo toast only appears once the confirmation is saved.
  async function handleComplete() {
    try {
      await completeStop({ stopId: stop.id });
    } catch (error) {
      if (getErrorCode(error) === 'CARGO_NOT_YET_LOADED') {
        // The route on screen was out of date; reloading it disables the button with the reason.
        void refetchStops();
        showErrorToast({ title: 'Najprije potvrdi utovar.', description: 'Teret ovog istovara još nije utovaren.' });
        return;
      }
      showErrorToast({ title: 'Potvrda nije uspjela. Pokušaj ponovno.' });
      return;
    }

    onCompleted?.();
    const confirmToastKey = showSuccessToast({
      title: labels.confirmed,
      description: getStopToastDescription(stop),
      timeout: UNDO_TIMEOUT_MS,
      action: { label: 'Poništi', onClick: () => void handleUndo(confirmToastKey) },
    });
  }

  const button = (
    <Button className="w-full" disabled={isBlocked} loading={isPending} size="xl" onClick={() => void handleComplete()}>
      {isPending ? 'Potvrđujem…' : labels.action}
    </Button>
  );

  if (!isBlocked) return button;

  const loadingStopNames = getPendingLoadingStops(notYetLoadedCargos, stops)
    .map(getStopShortName)
    .filter(Boolean)
    .join('; ');

  return (
    <div className="flex flex-col gap-2">
      {button}
      <div className="flex items-start gap-1 text-sm text-utovar">
        <Icon className="mt-0.5 shrink-0" icon="IconInfoCircle" size="s" />
        {loadingStopNames ? `Najprije potvrdi utovar: ${loadingStopNames}.` : 'Najprije potvrdi utovar ovog tereta.'}
      </div>
    </div>
  );
};
