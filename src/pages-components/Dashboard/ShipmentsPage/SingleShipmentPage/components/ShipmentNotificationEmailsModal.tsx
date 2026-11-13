import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm } from 'react-hook-form';
import { object, string } from 'yup';

import type { Shipment } from '@/lib/api';
import { useUpdateAgencyShipment, useUpdateShipment } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Box, Button, Dialog, DialogContent, DialogHeader, DialogTitle, FlexLayout, Text } from '@/ui';

import { NotificationEmailsField } from '../../NewShipmentPage/NotificationEmailsField';
import { notificationEmailsSchema } from '../../NewShipmentPage/schema';
import type { ShipmentFields } from '../../NewShipmentPage/types.d';

// Mounted only while open, so the form always starts from the saved list.
interface ShipmentNotificationEmailsModalProps {
  shipment: Shipment;
  onClose(): void;
}

// clientId is not edited here; the field reads it to suggest the client's contacts.
type FormValues = Pick<ShipmentFields, 'clientId' | 'notificationEmails'>;

const schema = object({ clientId: string().defined(), notificationEmails: notificationEmailsSchema.defined() });

export const ShipmentNotificationEmailsModal: React.FC<ShipmentNotificationEmailsModalProps> = ({
  shipment,
  onClose,
}) => {
  const { mutateAsync: updateShipment } = useUpdateShipment();
  const { mutateAsync: updateAgencyShipment } = useUpdateAgencyShipment();

  const formMethods = useForm<FormValues>({
    defaultValues: { clientId: shipment.clientId ?? '', notificationEmails: shipment.notificationEmails ?? [] },
    resolver: yupResolver(schema),
    mode: 'all',
  });
  const { handleSubmit, formState } = formMethods;
  const { isDirty, isValid, isSubmitting } = formState;

  async function handleFormSubmit({ notificationEmails }: FormValues) {
    try {
      if (shipment.isAgency) {
        await updateAgencyShipment({ id: shipment.id, notificationEmails });
      } else {
        await updateShipment({ id: shipment.id, notificationEmails });
      }
      showSuccessToast({ title: 'Emailovi za obavijesti spremljeni.' });
      onClose();
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Greška prilikom spremanja emailova. Pokušajte ponovno.' });
    }
  }

  return (
    <Dialog open>
      <DialogContent
        aria-describedby={undefined}
        className="max-w-[720px]"
        onEscapeKeyDown={() => !isSubmitting && onClose()}
        onInteractOutside={() => !isSubmitting && onClose()}
      >
        <DialogHeader className="flex-col">
          <DialogTitle>
            <Text variant="text-m-medium">Emailovi za obavijesti</Text>
          </DialogTitle>
          <Text color="text-color-3" variant="text-xs">
            Primaju mail kad se teret utovari i istovari.
          </Text>
        </DialogHeader>
        <FormProvider {...formMethods}>
          <FlexLayout as="form" className="flex-col gap-4" onSubmit={handleSubmit(handleFormSubmit)}>
            <NotificationEmailsField isAutofillEnabled={false} />
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
