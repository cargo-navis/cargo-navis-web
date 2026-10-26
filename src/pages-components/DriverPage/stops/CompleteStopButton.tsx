import { closeToast } from '@heroui/react';
import dayjs from 'dayjs';

import type { DriverStop } from '@/lib/api/driver';
import { useCompleteDriverStop, useUncompleteDriverStop } from '@/lib/hooks/api/driver';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Button, FlexLayout, Icon, Text } from '@/ui';

import { getStopKindLabels } from '../utils';

export const UNDO_TIMEOUT_MS = 5_000;

function formatCompletedAt(completedAt: string) {
  const date = dayjs(completedAt);
  return date.isSame(dayjs(), 'day') ? date.format('HH:mm') : date.format('D.M. HH:mm');
}

export const CompleteStopButton: React.FC<{ stop: DriverStop }> = ({ stop }) => {
  const { mutateAsync: completeStop, isPending } = useCompleteDriverStop();
  const { mutateAsync: uncompleteStop } = useUncompleteDriverStop();

  if (stop.completedAt) {
    return (
      <FlexLayout className="items-center gap-2">
        <Icon color="text-green-600" icon="IconCircleCheck" size="m" />
        <Text color="text-color-2" variant="text-xs-medium">
          Potvrđeno {formatCompletedAt(stop.completedAt)}
        </Text>
      </FlexLayout>
    );
  }

  const labels = getStopKindLabels(stop);

  async function handleUndo(confirmToastKey: string | null) {
    if (confirmToastKey) closeToast(confirmToastKey);
    try {
      await uncompleteStop({ stopId: stop.id });
      showSuccessToast({ title: 'Potvrda poništena' });
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
