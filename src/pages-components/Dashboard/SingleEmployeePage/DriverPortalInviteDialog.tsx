import { useState } from 'react';

import { sleep } from '@/lib/utils/async';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FlexLayout,
  Icon,
  Skeleton,
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
  const [isCopying, setIsCopying] = useState(false);
  // The dialog opens while the invite is still being generated; the url arrives once it is.
  const isGenerating = !url;
  const isLocked = isGenerating || isCopying;

  async function handleCopy() {
    setIsCopying(true);
    try {
      // Copy before the delay: Safari rejects clipboard writes that land too long after the click.
      await navigator.clipboard.writeText(url);
      await sleep(1500);
      showSuccessToast({
        title: 'Pozivnica kopirana u međuspremnik.',
        description: 'Sada je pošalji vozaču putem SMS-a, WhatsAppa ili emaila.',
      });
      onClose();
    } catch {
      showErrorToast({ title: 'Kopiranje nije uspjelo.' });
      setIsCopying(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLocked && onClose()}>
      <DialogContent className="max-w-[720px]">
        <DialogHeader>
          <DialogTitle>
            <FlexLayout className="items-center gap-2">
              <Icon icon="IconDeviceMobileShare" size="m" />
              <Text variant="text-m-medium">Pozivnica za vozački portal</Text>
            </FlexLayout>
          </DialogTitle>
          <FlexLayout className="items-center gap-1">
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

        <Box className="relative">
          <TextInput isDisabled value={url} onChange={() => {}} />
          {isGenerating && (
            <Box className="absolute inset-0 flex items-center px-3">
              <Skeleton borderRadius="xs" height={20} width="75%" />
            </Box>
          )}
        </Box>
        <Alert icon="IconInfoCircle" text="Pozivnica vrijedi 14 dana." />
        <DialogFooter>
          <Button isDisabled={isLocked} text="Zatvori" variant="secondary" onClick={onClose} />
          <Button
            iconLeft="IconCopy"
            isDisabled={isGenerating}
            isLoading={isCopying}
            text="Kopiraj"
            onClick={handleCopy}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
