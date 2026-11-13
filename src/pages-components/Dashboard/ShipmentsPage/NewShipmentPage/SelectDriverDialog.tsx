import { useEffect, useMemo, useState } from 'react';

import { useDrivers } from '@/lib/hooks';
import { mapEmployeesToOptions } from '@/lib/utils/employees';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FlexLayout,
  Icon,
  Switch,
  Text,
} from '@/ui';
import { SingleSelectWithLabels } from '@/ui/hocs';

interface SelectDriverDialogProps {
  isOpen: boolean;
  vehicleRegistration: string;
  orderNumber: string;
  isAssigning: boolean;
  onConfirm(pickedDriver: { driverId: string; shouldNotify: boolean }): void;
  onBack(): void;
}

export const SelectDriverDialog: React.FC<SelectDriverDialogProps> = ({
  isOpen,
  vehicleRegistration,
  orderNumber,
  isAssigning,
  onConfirm,
  onBack,
}) => {
  const { data: drivers = [], isLoading } = useDrivers({ enabled: isOpen });
  const options = useMemo(() => mapEmployeesToOptions(drivers), [drivers]);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [shouldNotify, setShouldNotify] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      setDriverId(null);
      setShouldNotify(true);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isAssigning && onBack()}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            <FlexLayout className="items-center gap-2 text-teal-700 dark:text-teal-400">
              <Icon icon="IconSteeringWheel" size="m" />
              <Text color="text-inherit" variant="text-m-medium">
                Odaberi vozača
              </Text>
            </FlexLayout>
          </DialogTitle>
        </DialogHeader>
        <DialogDescription asChild>
          <Text color="text-color-2" variant="text-s">
            Vozilo <strong>{vehicleRegistration}</strong> nema vozača. Odaberi tko vozi nalog{' '}
            <strong>{orderNumber}</strong>.
          </Text>
        </DialogDescription>
        <SingleSelectWithLabels
          isDisabled={isLoading || isAssigning}
          isSearchable
          label="Vozač *"
          options={options}
          placeholder="Odaberi vozača..."
          value={driverId ?? ''}
          onChange={(value) => setDriverId(value ? String(value) : null)}
        />
        <FlexLayout className="items-center justify-between gap-3">
          <FlexLayout className="flex-col">
            <Text color="text-color-1" variant="text-s-medium">
              Obavijesti vozača odmah
            </Text>
            <Text color="text-color-3" variant="text-xs">
              Vozač dobiva sve informacije o nalogu. Možeš to učiniti i poslije.
            </Text>
          </FlexLayout>
          <Switch isDisabled={isAssigning} value={shouldNotify} onChange={setShouldNotify} />
        </FlexLayout>
        <DialogFooter>
          <Button isDisabled={isAssigning} text="Natrag" variant="secondary" onClick={onBack} />
          <Button
            iconLeft={shouldNotify ? 'IconBellPlus' : undefined}
            isDisabled={!driverId}
            isLoading={isAssigning}
            text={shouldNotify ? 'Dodijeli i obavijesti' : 'Dodijeli'}
            onClick={() => driverId && onConfirm({ driverId, shouldNotify })}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
