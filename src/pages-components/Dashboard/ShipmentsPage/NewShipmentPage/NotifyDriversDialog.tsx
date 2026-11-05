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
  Text,
} from '@/ui';

interface NotifyDriversDialogProps {
  isOpen: boolean;
  driverNames: string[];
  isNotifying: boolean;
  onNotify(): void;
  onSkip(): void;
}

export const NotifyDriversDialog: React.FC<NotifyDriversDialogProps> = ({
  isOpen,
  driverNames,
  isNotifying,
  onNotify,
  onSkip,
}) => {
  const hasManyDrivers = driverNames.length > 1;
  const drivers = driverNames.length > 0 ? driverNames.join(', ') : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isNotifying && onSkip()}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            <FlexLayout className="items-center gap-2">
              <Icon icon="IconBellPlus" size="m" />
              <Text variant="text-m-medium">{hasManyDrivers ? 'Obavijestiti vozače?' : 'Obavijestiti vozača?'}</Text>
            </FlexLayout>
          </DialogTitle>
        </DialogHeader>
        <DialogDescription asChild>
          <Text color="text-color-2" variant="text-s">
            {drivers ? `${hasManyDrivers ? 'Vozači' : 'Vozač'} ${drivers} dobit će` : 'Vozač će dobiti'} obavijest o
            postajama ovog naloga. Možeš to učiniti i kasnije, s naloga.
          </Text>
        </DialogDescription>
        <DialogFooter>
          <Button isDisabled={isNotifying} text="Ne sada" variant="secondary" onClick={onSkip} />
          <Button
            iconLeft="IconBellPlus"
            isLoading={isNotifying}
            text={hasManyDrivers ? 'Obavijesti vozače' : 'Obavijesti vozača'}
            onClick={onNotify}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
