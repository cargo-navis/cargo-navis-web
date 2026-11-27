import * as React from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/**
 * Dialogs and sheets with a form (DECISIONS §3 Dialog): outside click / Esc / Odustani close at once when nothing was
 * typed, and ask „Odbaciti promjene?” when the form is dirty (the one allowed dialog-on-dialog). Lab /overlays/dialog.
 *
 *   const guard = useDiscardGuard({ dirty: form.formState.isDirty, onClose: () => setOpen(false) });
 *   <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : guard.requestClose())}>
 *     … <DialogClose render={<Button variant="ghost" />}>Odustani</DialogClose> …
 *   </Dialog>
 *   {guard.discardDialog}
 */
export function useDiscardGuard({
  dirty,
  onClose,
  description = 'Upisani podaci neće se spremiti.',
}: {
  dirty: boolean;
  onClose(): void;
  description?: React.ReactNode;
}) {
  const [asking, setAsking] = React.useState(false);

  const requestClose = React.useCallback(() => {
    if (dirty) setAsking(true);
    else onClose();
  }, [dirty, onClose]);

  const discardDialog = (
    <DiscardChangesDialog
      description={description}
      open={asking}
      onDiscard={() => {
        setAsking(false);
        onClose();
      }}
      onOpenChange={setAsking}
    />
  );

  return { requestClose, discardDialog };
}

export function DiscardChangesDialog({
  open,
  onOpenChange,
  onDiscard,
  description = 'Upisani podaci neće se spremiti.',
}: {
  open: boolean;
  onOpenChange(open: boolean): void;
  onDiscard(): void;
  description?: React.ReactNode;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Odbaciti promjene?</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Nastavi uređivanje</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onDiscard}>
            Odbaci
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
