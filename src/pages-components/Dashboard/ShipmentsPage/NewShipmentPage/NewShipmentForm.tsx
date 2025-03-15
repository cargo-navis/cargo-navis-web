import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';
import { FormProvider, useForm } from 'react-hook-form';

import type { Shipment } from '@/lib/api';
import { FormTextInput } from '@/lib/components/form';
import { useCreateShipment, useUpdateShipment } from '@/lib/hooks';
import { Box, Button, Divider, FlexLayout, LoadingSpinner } from '@/ui';

import AddressFields from './AddressFields';
import { CargoFieldList } from './CargoFieldList';
import { ClientField } from './ClientField';
import { ContractorField } from './ContractorField';
import { DispatcherField } from './DispatcherField';
import { DriverField } from './DriverField';
import { shipmentSchema } from './schema';
import type { ShipmentFields } from './types';
import { getFormDefaultValues, transformFormDataToPayload } from './utils';
import { VehicleField } from './VehicleField';

interface NewShipmentFormProps {
  shipment?: Shipment;
}

export const NewShipmentForm: React.FC<NewShipmentFormProps> = ({ shipment }) => {
  const { push } = useRouter();
  const isEdit = !!shipment;

  const { mutateAsync: createShipment } = useCreateShipment();
  const { mutateAsync: updateShipment } = useUpdateShipment();

  const formMethods = useForm<ShipmentFields>({
    defaultValues: getFormDefaultValues(shipment),
    resolver: yupResolver(shipmentSchema),
    mode: 'all',
  });

  const { handleSubmit, formState } = formMethods;
  const { isDirty, isValid, isLoading, isSubmitting } = formState;

  async function handleFormSubmit(data: ShipmentFields) {
    const payload = transformFormDataToPayload(data);
    console.log(payload);

    try {
      if (isEdit && shipment) {
        await updateShipment({ id: shipment.id, ...payload });
        await push(`/dashboard/shipments/${shipment.id}`);
      } else {
        await createShipment(payload);
        await push('/dashboard/shipments');
      }
    } catch {
      alert('Dogodila se greška s unosom naloga. Pokušajte ponovno.');
    }
  }

  if (isLoading) {
    return <LoadingSpinner size="l" />;
  }

  return (
    <FormProvider {...formMethods}>
      <Box as="form" className="max-w-[1400px]" onSubmit={handleSubmit(handleFormSubmit)}>
        <FlexLayout className="relative flex-col gap-7 w-full">
          <FlexLayout className="flex-row gap-7">
            <FlexLayout className="flex-1 flex-col gap-4">
              <FlexLayout as="fieldset" className="flex-col gap-5">
                <FlexLayout className="gap-4">
                  <Box className="flex-1">
                    <FormTextInput iconLeft="LockClosedIcon" isDisabled label="Broj naloga" name="orderNumber" />
                  </Box>
                  <Box className="flex-1">
                    <FormTextInput label="Referentni broj" name="cargoReference" placeholder="1234" />
                  </Box>
                </FlexLayout>
                <Box className="flex-1">
                  <ContractorField name="transportContractorId" />
                </Box>
                <FlexLayout className="gap-4">
                  <Box className="flex-1">
                    <ClientField />
                  </Box>
                  <Box className="flex-1">
                    <FormTextInput
                      iconLeft="CurrencyEuroIcon"
                      label="Cijena (Euro)"
                      min="0"
                      name="price"
                      placeholder="XXX"
                      type="number"
                    />
                  </Box>
                </FlexLayout>
                <FlexLayout className="gap-4">
                  <Box className="flex-1">
                    <DriverField />
                  </Box>
                  <Box className="flex-1">
                    <VehicleField />
                  </Box>
                </FlexLayout>
                <Box className="flex-1">
                  <DispatcherField />
                </Box>
              </FlexLayout>
              <Box className="py-4">
                <Divider />
              </Box>
              <AddressFields />
            </FlexLayout>
            <CargoFieldList />
          </FlexLayout>
          <Box className="sticky bottom-0 bg-[#e9eded] dark:bg-black border-t-[2px] border-dark-200 dark:border-light-700 p-4 -mx-4">
            <Button
              isDisabled={!(isValid && isDirty)}
              isFullWidth
              isLoading={isSubmitting}
              text={isEdit ? 'Ažuriraj nalog' : 'Napravi nalog'}
              type="submit"
              variant="primary"
            />
          </Box>
        </FlexLayout>
      </Box>
    </FormProvider>
  );
};
