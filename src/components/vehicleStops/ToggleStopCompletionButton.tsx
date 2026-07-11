import dayjs from 'dayjs';

import type { VehicleStop } from '@/lib/api/vehicleStops';
import { useCompleteVehicleStop, useUncompleteVehicleStop } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { getStopCompletionEligibility, isStopCompleted } from '@/lib/utils/vehicleStops';
import { Box, DisplayIf, FlexLayout, Text, TextButton, Tooltip } from '@/ui';

interface ToggleStopCompletionButtonProps {
  stop: VehicleStop;
  // Route-chronological neighbours (earlier / later). Undefined at the route ends.
  previousStop?: VehicleStop;
  nextStop?: VehicleStop;
  iconOnly?: boolean;
}

export const ToggleStopCompletionButton = ({
  stop,
  previousStop,
  nextStop,
  iconOnly = false,
}: ToggleStopCompletionButtonProps) => {
  const isCompleted = isStopCompleted(stop);
  const { canComplete, canUncomplete } = getStopCompletionEligibility(stop, previousStop, nextStop);

  const { mutateAsync: completeStop, isPending: isCompleting } = useCompleteVehicleStop(stop.id);
  const { mutateAsync: uncompleteStop, isPending: isUncompleting } = useUncompleteVehicleStop(stop.id);

  const isToggling = isCompleting || isUncompleting;
  const actionAllowed = isCompleted ? canUncomplete : canComplete;
  const isDisabled = isToggling || !actionAllowed;

  const actionLabel = isCompleted ? 'Označi nedovršenom' : 'Označi dovršenom';
  const disabledReason = actionAllowed
    ? undefined
    : isCompleted
      ? 'Prvo poništite sve stanice nakon ove.'
      : 'Prvo dovršite prethodne stanice.';

  async function handleToggleCompleted() {
    if (!actionAllowed) return;
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

  const tooltipContent = (
    <FlexLayout className="flex-col px-2 py-1">
      <Text className="whitespace-nowrap" color="text-light-50" variant="text-xxs-bold">
        {disabledReason ?? actionLabel}
      </Text>
      <DisplayIf condition={!!stop.completedAt}>
        <Text className="whitespace-nowrap" color="text-light-200" variant="text-xxs">
          (dovršeno {dayjs(stop.completedAt).format('DD.MM.YYYY, HH:mm')})
        </Text>
      </DisplayIf>
    </FlexLayout>
  );

  if (iconOnly) {
    return (
      // A disabled TextButton renders no pointer events, so anchor the tooltip
      // on a wrapping Box that stays hoverable even when the button is disabled.
      <Tooltip content={tooltipContent} isPortal>
        <Box className="inline-flex">
          <TextButton
            iconLeft={isCompleted ? 'IconArrowBackUp' : 'IconCheck'}
            isDisabled={isDisabled}
            size="m"
            text=""
            type="button"
            variant={isCompleted ? 'primary' : 'secondary'}
            onClick={handleToggleCompleted}
          />
        </Box>
      </Tooltip>
    );
  }

  return (
    <>
      <Tooltip content={tooltipContent} isPortal>
        <Box className="inline-flex">
          <TextButton
            iconLeft={isCompleted ? 'IconArrowBackUp' : 'IconCheck'}
            isDisabled={isDisabled}
            size="s"
            text={actionLabel}
            type="button"
            variant={isCompleted ? 'primary' : 'secondary'}
            onClick={handleToggleCompleted}
          />
        </Box>
      </Tooltip>
      {stop.completedAt && (
        <Text className="whitespace-nowrap" color="text-color-3" variant="text-xxxs">
          Dovršeno {dayjs(stop.completedAt).format('DD.MM.YYYY, HH:mm')}
        </Text>
      )}
    </>
  );
};
