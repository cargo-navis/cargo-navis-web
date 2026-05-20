import { yupResolver } from '@hookform/resolvers/yup';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { object, string } from 'yup';

import { FormTextarea } from '@/lib/components/form';
import { useUpdateShipment } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Box, Button, Dialog, DialogContent, DialogHeader, DialogTitle, FlexLayout, Icon, Text } from '@/ui';

interface ShipmentNoteModalProps {
  isOpen: boolean;
  shipmentId: string;
  initialNote?: string | null;
  onClose(): void;
}

interface NoteFormValues {
  note: string;
}

const NOTE_MAX_LENGTH = 255;

const noteSchema = object({
  note: string().trim().max(NOTE_MAX_LENGTH, `Maksimalno ${NOTE_MAX_LENGTH} znakova`).defined(),
});

export const ShipmentNoteModal: React.FC<ShipmentNoteModalProps> = ({ isOpen, shipmentId, initialNote, onClose }) => {
  const queryClient = useQueryClient();
  const { mutateAsync: updateShipment } = useUpdateShipment();

  const formMethods = useForm<NoteFormValues>({
    defaultValues: { note: initialNote ?? '' },
    resolver: yupResolver(noteSchema),
    mode: 'all',
  });

  const { handleSubmit, formState, reset, watch } = formMethods;
  const { isDirty, isValid, isSubmitting } = formState;
  const currentLength = watch('note')?.length ?? 0;

  useEffect(() => {
    if (isOpen) reset({ note: initialNote ?? '' });
  }, [isOpen, initialNote, reset]);

  async function handleFormSubmit(values: NoteFormValues) {
    try {
      await updateShipment({ id: shipmentId, note: values.note.trim() || null });
      await queryClient.invalidateQueries({ queryKey: ['shipment', shipmentId] });
      showSuccessToast({ title: 'Napomena spremljena' });
      onClose();
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Greška prilikom spremanja napomene. Pokušajte ponovno.' });
    }
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-[720px]"
        onEscapeKeyDown={() => !isSubmitting && onClose()}
        onInteractOutside={() => !isSubmitting && onClose()}
      >
        <DialogHeader className="flex-col">
          <FlexLayout className="items-center gap-2 text-dark-800 dark:text-light-50">
            <DialogTitle>
              <Text variant="text-m-medium">Napomena</Text>
            </DialogTitle>
            <Icon icon="IconInfoCircle" size="m" />
          </FlexLayout>
          <Text color="text-color-3" variant="text-xs">
            Interna napomena — nije vidljiva na izlaznim dokumentima.
          </Text>
        </DialogHeader>
        <FormProvider {...formMethods}>
          <FlexLayout as="form" className="flex-col gap-4" onSubmit={handleSubmit(handleFormSubmit)}>
            <FormTextarea
              charLimit={NOTE_MAX_LENGTH}
              helperText={`${currentLength}/${NOTE_MAX_LENGTH} znakova`}
              name="note"
              placeholder="Unesi napomenu..."
              rows={6}
            />
            <FlexLayout className="justify-end gap-3 pt-2">
              <Box className="flex-1">
                <Button
                  isDisabled={isSubmitting}
                  isFullWidth
                  text="Odustani"
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                />
              </Box>
              <Box className="flex-1">
                <Button isDisabled={!isValid || !isDirty} isFullWidth isLoading={isSubmitting} text="Spremi" />
              </Box>
            </FlexLayout>
          </FlexLayout>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
