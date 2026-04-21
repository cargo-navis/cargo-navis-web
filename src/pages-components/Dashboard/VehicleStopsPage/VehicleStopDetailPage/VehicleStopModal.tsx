import { useEffect, useState } from 'react';

import type { VehicleStop } from '@/lib/api/vehicleStops';
import { Dialog, DialogContent, DialogHeader, DialogTitle, FlexLayout, Icon } from '@/ui';

import { VehicleStopForm } from './VehicleStopForm';

const DIALOG_TRANSITION_MS = 200;

interface VehicleStopModalProps {
  isOpen: boolean;
  vehicleId: string;
  stop?: VehicleStop;
  previousStopId?: string | null;
  onClose(): void;
}

export const VehicleStopModal: React.FC<VehicleStopModalProps> = ({
  isOpen,
  vehicleId,
  stop,
  previousStopId,
  onClose,
}) => {
  const isEditMode = !!stop;
  const [isDirty, setIsDirty] = useState(false);

  const [shouldRenderForm, setShouldRenderForm] = useState(isOpen);
  const [renderedStop, setRenderedStop] = useState<VehicleStop | undefined>(stop);
  const [renderedPreviousStopId, setRenderedPreviousStopId] = useState<string | null | undefined>(previousStopId);

  useEffect(() => {
    if (isOpen) {
      setShouldRenderForm(true);
      setRenderedStop(stop);
      setRenderedPreviousStopId(previousStopId);
      return;
    }
    const timeoutId = setTimeout(() => setShouldRenderForm(false), DIALOG_TRANSITION_MS);
    return () => clearTimeout(timeoutId);
  }, [isOpen, stop, previousStopId]);

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
            <Icon icon="StopCircleIcon" size="m" />
            <DialogTitle className="font-medium">{isEditMode ? 'Uredi stanicu' : 'Nova stanica'}</DialogTitle>
          </FlexLayout>
          <Icon className="cursor-pointer" icon="XMarkIcon" onClick={onClose} />
        </DialogHeader>
        {shouldRenderForm && (
          <VehicleStopForm
            key={renderedStop?.id ?? 'create'}
            previousStopId={renderedPreviousStopId}
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
