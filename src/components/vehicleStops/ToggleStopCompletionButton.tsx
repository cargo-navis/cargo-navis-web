import dayjs from 'dayjs';

import type { VehicleStop } from '@/lib/api/vehicleStops';
import { useCompleteVehicleStop, useUncompleteVehicleStop } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { isStopCompleted } from '@/lib/utils/vehicleStops';
import { Box, DisplayIf, FlexLayout, Text, TextButton, Tooltip } from '@/ui';

interface ToggleStopCompletionButtonProps {
  stop: VehicleStop;
  iconOnly?: boolean;
}

export const ToggleStopCompletionButton = ({ stop, iconOnly = false }: ToggleStopCompletionButtonProps) => {
  const isCompleted = isStopCompleted(stop);

  const { mutateAsync: completeStop, isPending: isCompleting } = useCompleteVehicleStop(stop.id);
  const { mutateAsync: uncompleteStop, isPending: isUncompleting } = useUncompleteVehicleStop(stop.id);

  const isToggling = isCompleting || isUncompleting;
  const isDisabled = isToggling;

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
      const errorCode = (error as { response?: { data?: { errorCode?: string } } })?.response?.data?.errorCode;
      if (errorCode === 'CARGO_NOT_YET_LOADED') {
        showErrorToast({
          title: 'Nije moguće potvrditi istovar — teret još nije utovaren.',
          description: 'Molimo prvo potvrdite utovarnu postaju.',
          timeout: 5000,
        });
        return;
      }
      if (errorCode === 'CARGO_STATUS_CHANGED_BY_LATER_STOP') {
        showErrorToast({
          title: 'Nije moguće poništiti postaju — status tereta je već promijenjen na kasnijoj postaji.',
          description: 'Molimo prvo poništite kasniju postaju.',
          timeout: 5000,
        });
        return;
      }
      showErrorToast({ title: 'Greška prilikom promjene statusa stanice. Pokušajte ponovno.' });
    }
  }

  const tooltipContent = (
    <FlexLayout className="flex-col px-2 py-1">
      <Text className="whitespace-nowrap" color="text-light-50" variant="text-xxs-bold">
        {actionLabel}
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
