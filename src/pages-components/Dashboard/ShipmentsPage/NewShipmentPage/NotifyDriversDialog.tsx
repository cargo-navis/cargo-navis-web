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
  orderNumber: string;
  driverNames: string[];
  isNotifying: boolean;
  onNotify(): void;
  onSkip(): void;
}

export const NotifyDriversDialog: React.FC<NotifyDriversDialogProps> = ({
  isOpen,
  orderNumber,
  driverNames,
  isNotifying,
  onNotify,
  onSkip,
}) => {
  const hasManyDrivers = driverNames.length > 1;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isNotifying && onSkip()}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            <FlexLayout className="items-center gap-2 text-teal-700 dark:text-teal-400">
              <Icon icon="IconBellPlus" size="m" />
              <Text color="text-inherit" variant="text-m-medium">
                {hasManyDrivers ? 'Obavijesti vozače?' : 'Obavijesti vozača?'}
              </Text>
            </FlexLayout>
          </DialogTitle>
        </DialogHeader>
        <DialogDescription asChild>
          <Text color="text-color-2" variant="text-s">
            Želiš li poslati sve informacije vezane uz nalog <strong>{orderNumber}</strong>{' '}
            {hasManyDrivers ? 'vozačima' : 'vozaču'}
            {driverNames.length > 0 && (
              <>
                {' '}
                <strong>{driverNames.join(', ')}</strong>
              </>
            )}
            ? Možeš to učiniti i poslije.
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
