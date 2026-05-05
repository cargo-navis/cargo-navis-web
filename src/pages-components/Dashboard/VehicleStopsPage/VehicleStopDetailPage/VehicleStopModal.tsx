import { useEffect, useState } from 'react';

import type { VehicleStop } from '@/lib/api/vehicleStops';
import { Dialog, DialogContent, DialogHeader, DialogTitle, FlexLayout, Icon2 } from '@/ui';

import { VehicleStopForm } from './VehicleStopForm';

const DIALOG_TRANSITION_MS = 200;

interface VehicleStopModalProps {
  isOpen: boolean;
  vehicleId: string;
  stop?: VehicleStop;
  previousStop?: VehicleStop;
  onClose(): void;
}

export const VehicleStopModal: React.FC<VehicleStopModalProps> = ({
  isOpen,
  vehicleId,
  stop,
  previousStop,
  onClose,
}) => {
  const isEditMode = !!stop;
  const [isDirty, setIsDirty] = useState(false);

  const [shouldRenderForm, setShouldRenderForm] = useState(isOpen);
  const [renderedStop, setRenderedStop] = useState<VehicleStop | undefined>(stop);
  const [renderedPreviousStop, setRenderedPreviousStop] = useState<VehicleStop | undefined>(previousStop);

  useEffect(() => {
    if (isOpen) {
      setShouldRenderForm(true);
      setRenderedStop(stop);
      setRenderedPreviousStop(previousStop);
      return;
    }
    const timeoutId = setTimeout(() => setShouldRenderForm(false), DIALOG_TRANSITION_MS);
    return () => clearTimeout(timeoutId);
  }, [isOpen, stop, previousStop]);

  return (
    <Dialog open={isOpen}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-[800px]"
        onEscapeKeyDown={(e) => {
          if (isDirty) e.preventDefault();
          else onClose();
        }}
        onInteractOutside={(e) => {
          if (isDirty) e.preventDefault();
          else onClose();
        }}
      >
        <DialogHeader className="flex-row items-center justify-between">
          <FlexLayout className="items-center gap-1">
            <Icon2 icon="IconCircle" size="m" />
            <DialogTitle className="font-medium">{isEditMode ? 'Uredi stanicu' : 'Nova stanica'}</DialogTitle>
          </FlexLayout>
          <Icon2 className="cursor-pointer" icon="IconX" onClick={onClose} />
        </DialogHeader>
        {shouldRenderForm && (
          <VehicleStopForm
            key={renderedStop?.id ?? `create:${renderedPreviousStop?.id ?? 'top'}`}
            previousStop={renderedPreviousStop}
            stop={renderedStop}
            vehicleId={vehicleId}
            onDirtyChange={setIsDirty}
            onSuccess={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
