import { closeToast } from '@heroui/react';

import type { DriverStop } from '@/lib/api/driver';
import { useCompleteDriverStop, useUncompleteDriverStop } from '@/lib/hooks/api/driver';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Button } from '@/ui';

import { getStopKindLabels, getStopToastDescription } from '../utils';

export const UNDO_TIMEOUT_MS = 5_000;

export const CompleteStopButton: React.FC<{ stop: DriverStop }> = ({ stop }) => {
  const { mutateAsync: completeStop, isPending } = useCompleteDriverStop();
  const { mutateAsync: uncompleteStop } = useUncompleteDriverStop();

  // A confirmed stop shows its time in the green section header instead (see StopDetails).
  if (stop.completedAt) return null;

  const labels = getStopKindLabels(stop);

  async function handleUndo(confirmToastKey: string | null) {
    if (confirmToastKey) closeToast(confirmToastKey);
    try {
      await uncompleteStop({ stopId: stop.id });
      showSuccessToast({ title: 'Potvrda poništena', description: getStopToastDescription(stop) });
    } catch {
      showErrorToast({ title: 'Poništavanje nije uspjelo.' });
    }
  }

  // The button shows the pending state while saving; the undo toast only appears once the confirmation is saved.
  async function handleComplete() {
    try {
      await completeStop({ stopId: stop.id });
    } catch {
      showErrorToast({ title: 'Potvrda nije uspjela. Pokušaj ponovno.' });
      return;
    }

    const confirmToastKey = showSuccessToast({
      title: labels.confirmed,
      description: getStopToastDescription(stop),
      timeout: UNDO_TIMEOUT_MS,
      shouldShowTimeoutProgress: true,
      endContent: (
        <Button size="m" text="Poništi" variant="secondary" onClick={() => void handleUndo(confirmToastKey)} />
      ),
    });
  }

  return (
    <Button isFullWidth isLoading={isPending} size="l" text={labels.action} onClick={() => void handleComplete()} />
  );
};
