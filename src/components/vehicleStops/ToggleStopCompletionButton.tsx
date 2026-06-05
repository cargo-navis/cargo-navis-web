import dayjs from 'dayjs';

import type { VehicleStop } from '@/lib/api/vehicleStops';
import { useCompleteVehicleStop, useUncompleteVehicleStop } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { isStopCompleted } from '@/lib/utils/vehicleStops';
import { DisplayIf, FlexLayout, Text, TextButton, Tooltip } from '@/ui';

interface ToggleStopCompletionButtonProps {
  stop: VehicleStop;
  iconOnly?: boolean;
}

export const ToggleStopCompletionButton = ({ stop, iconOnly = false }: ToggleStopCompletionButtonProps) => {
  const isCompleted = isStopCompleted(stop);
  const { mutateAsync: completeStop, isPending: isCompleting } = useCompleteVehicleStop(stop.id);
  const { mutateAsync: uncompleteStop, isPending: isUncompleting } = useUncompleteVehicleStop(stop.id);

  const isToggling = isCompleting || isUncompleting;
  const actionLabel = isCompleted ? 'Označi nedovršenom' : 'Označi dovršenom';

  async function handleToggleCompleted() {
    try {
      if (isCompleted) {
        await uncompleteStop();
        showSuccessToast({ title: 'Stanica označena nedovršenom' });
      } else {
        await completeStop();
        showSuccessToast({ title: 'Stanica označena dovršenom' });
      }
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Greška prilikom promjene statusa stanice. Pokušajte ponovno.' });
    }
  }

  if (iconOnly) {
    return (
      <Tooltip
        content={
          <FlexLayout className="flex-col px-2 py-1">
            <Text className="whitespace-nowrap" color="text-light-50" variant="text-xxs-bold">
              {actionLabel}
            </Text>
            <DisplayIf condition={!!stop.completedAt}>
              <Text className="whitespace-nowrap" color="text-light-200" variant="text-xxs">
                • Dovršeno {dayjs(stop.completedAt).format('DD.MM.YYYY, HH:mm')}
              </Text>
            </DisplayIf>
          </FlexLayout>
        }
        isPortal
      >
        <TextButton
          iconLeft={isCompleted ? 'IconArrowBackUp' : 'IconCheck'}
          isDisabled={isToggling}
          size="m"
          text=""
          type="button"
          variant={isCompleted ? 'primary' : 'secondary'}
          onClick={handleToggleCompleted}
        />
      </Tooltip>
    );
  }

  return (
    <>
      <TextButton
        iconLeft={isCompleted ? 'IconArrowBackUp' : 'IconCheck'}
        isDisabled={isToggling}
        size="s"
        text={actionLabel}
        type="button"
        variant={isCompleted ? 'primary' : 'secondary'}
        onClick={handleToggleCompleted}
      />
      {stop.completedAt && (
        <Text className="whitespace-nowrap" color="text-color-3" variant="text-xxxs">
          Dovršeno {dayjs(stop.completedAt).format('DD.MM.YYYY, HH:mm')}
        </Text>
      )}
    </>
  );
};
