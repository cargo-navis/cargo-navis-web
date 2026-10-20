import { closeToast } from '@heroui/react';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

import type { DriverStop } from '@/lib/api/driver';
import { useCompleteDriverStop, useUncompleteDriverStop } from '@/lib/hooks/api/driver';
import { showErrorToast, showPromiseToast } from '@/lib/utils/toast';
import { Button, FlexLayout, Icon, Text } from '@/ui';

import { getStopKindLabels } from './utils';

export const UNDO_TIMEOUT_MS = 10_000;

function formatCompletedAt(completedAt: string) {
  const date = dayjs(completedAt);
  return date.isSame(dayjs(), 'day') ? date.format('HH:mm') : date.format('D.M. HH:mm');
}

/** Promise toast whose error path closes it and shows an error toast instead. */
function showActionToast(params: Parameters<typeof showPromiseToast>[0], errorTitle: string) {
  const toastKey = showPromiseToast(params);
  params.promise.catch(() => {
    if (toastKey) closeToast(toastKey);
    showErrorToast({ title: errorTitle });
  });
  return toastKey;
}

// Undo only makes sense once the confirmation has actually been saved.
const UndoToastButton: React.FC<{ completion: Promise<unknown>; onUndo(): void }> = ({ completion, onUndo }) => {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    let isActive = true;
    completion.then(
      () => isActive && setIsSaved(true),
      () => undefined
    );
    return () => {
      isActive = false;
    };
  }, [completion]);

  return <Button isDisabled={!isSaved} size="m" text="Poništi" variant="secondary" onClick={onUndo} />;
};

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

  function handleUndo(confirmToastKey: string | null) {
    if (confirmToastKey) closeToast(confirmToastKey);
    showActionToast(
      { title: 'Potvrda poništena', promise: uncompleteStop({ stopId: stop.id }) },
      'Poništavanje nije uspjelo.'
    );
  }

  function handleComplete() {
    const completion = completeStop({ stopId: stop.id });
    // The undo button only runs after the toast exists, so it can read the key declared here.
    const confirmToastKey: string | null = showActionToast(
      {
        title: labels.confirmed,
        promise: completion,
        timeout: UNDO_TIMEOUT_MS,
        shouldShowTimeoutProgress: true,
        endContent: <UndoToastButton completion={completion} onUndo={() => handleUndo(confirmToastKey)} />,
      },
      'Potvrda nije uspjela. Pokušaj ponovno.'
    );
  }

  return <Button isFullWidth isLoading={isPending} size="l" text={labels.action} onClick={handleComplete} />;
};
