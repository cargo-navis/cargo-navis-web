import { Dialog, DialogContent, DialogHeader, DialogTitle, FlexLayout, Icon } from '@/ui';

import { VehicleStopForm } from './VehicleStopForm';

interface CreateVehicleStopModalProps {
  isOpen: boolean;
  vehicleId: string;
  onClose(): void;
}

export const CreateVehicleStopModal: React.FC<CreateVehicleStopModalProps> = ({ isOpen, vehicleId, onClose }) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-[600px]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex-row items-center justify-between">
          <FlexLayout className="items-center gap-1">
            <Icon icon="StopCircleIcon" size="m" />
            <DialogTitle className="font-medium">Nova stanica</DialogTitle>
          </FlexLayout>
          <Icon className="cursor-pointer" icon="XMarkIcon" onClick={onClose} />
        </DialogHeader>
        {isOpen && <VehicleStopForm vehicleId={vehicleId} onSuccess={onClose} />}
      </DialogContent>
    </Dialog>
  );
};
