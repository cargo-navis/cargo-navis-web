import dayjs from 'dayjs';

import type { VehicleStop } from '@/lib/api/vehicleStops';
import { useCompleteVehicleStop, useUncompleteVehicleStop } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { isStopCompleted } from '@/lib/utils/vehicleStops';
import { Text, TextButton } from '@/ui';

interface ToggleStopCompletionButtonProps {
  stop: VehicleStop;
}

export const ToggleStopCompletionButton = ({ stop }: ToggleStopCompletionButtonProps) => {
  const isCompleted = isStopCompleted(stop);
  const { mutateAsync: completeStop, isPending: isCompleting } = useCompleteVehicleStop(stop.id);
  const { mutateAsync: uncompleteStop, isPending: isUncompleting } = useUncompleteVehicleStop(stop.id);
  const isToggling = isCompleting || isUncompleting;

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

  return (
    <>
      <TextButton
        iconLeft={isCompleted ? 'IconArrowBackUp' : 'IconCheck'}
        isDisabled={isToggling}
        size="s"
        text={isCompleted ? 'Označi nedovršenom' : 'Označi dovršenom'}
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
