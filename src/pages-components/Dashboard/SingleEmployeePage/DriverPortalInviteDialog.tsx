import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import {
  Alert,
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
  TextInput,
} from '@/ui';

interface DriverPortalInviteDialogProps {
  isOpen: boolean;
  name: string;
  url: string;
  onClose(): void;
}

export const DriverPortalInviteDialog: React.FC<DriverPortalInviteDialogProps> = ({ isOpen, name, url, onClose }) => {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      showSuccessToast({
        title: 'Pozivnica kopirana u međuspremnik.',
        description: 'Sada je pošalji vozaču putem SMS-a, WhatsAppa ili emaila.',
      });
      onClose();
    } catch {
      showErrorToast({ title: 'Kopiranje nije uspjelo.' });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[720px]">
        <DialogHeader>
          <DialogTitle>
            <Text variant="text-m-medium">Pozivnica za vozački portal</Text>
          </DialogTitle>
          <FlexLayout className="items-center gap-1">
            <Icon color="text-color-3" icon="IconUser" size="s" />
            <Text as="span" color="text-color-3" variant="text-xs">
              {name}
            </Text>
          </FlexLayout>
        </DialogHeader>

        <DialogDescription asChild>
          <Text color="text-color-2" variant="text-s">
            Kopiraj ovu poveznicu i pošalji je vozaču putem SMS-a, WhatsAppa ili emaila. Otvaranjem poveznice vozač se
            prijavljuje u portal na mobitelu.
          </Text>
        </DialogDescription>

        <TextInput isDisabled value={url} onChange={() => {}} />
        <Alert icon="IconInfoCircle" text="Pozivnica vrijedi 14 dana." />
        <DialogFooter>
          <Button text="Zatvori" variant="secondary" onClick={onClose} />
          <Button iconLeft="IconCopy" text="Kopiraj" onClick={handleCopy} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
