import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';
import { FormProvider, useForm } from 'react-hook-form';

import { type Shipment, VehicleEnum } from '@/lib/api';
import type { Tenant } from '@/lib/api/tenant.d';
import { FormTextInput } from '@/lib/components/form';
import { useCreateShipment, useUpdateShipment } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Box, Button, FlexLayout, LoadingSpinner, VerticalDivider } from '@/ui';

import { AgencyField } from './AgencyField';
import { CargoFieldList } from './CargoFieldList';
import { ClientField } from './ClientField';
import { ContractorField } from './ContractorField';
import { DispatcherField } from './DispatcherField';
import { DriverField } from './DriverField';
import { PriceField } from './PriceField';
import { shipmentSchema } from './schema';
import type { ShipmentFields } from './types';
import { getFormDefaultValues, transformFormDataToPayload } from './utils';
import { VehicleField } from './VehicleField';

interface NewShipmentFormProps {
  shipment?: Shipment;
  tenant: Tenant;
  parentShipmentId?: string;
  copyFromId?: string;
}

export const NewShipmentForm: React.FC<NewShipmentFormProps> = ({ shipment, tenant, parentShipmentId, copyFromId }) => {
  const { push, back } = useRouter();
  const isEdit = !!shipment;
  const isCopy = !!copyFromId;

  // When copying, we use the shipment data but treat it as a new form (not an edit)
  const formMode = isEdit && !isCopy ? 'edit' : 'new';

  const { mutateAsync: createShipment } = useCreateShipment();
  const { mutateAsync: updateShipment } = useUpdateShipment();

  const formMethods = useForm<ShipmentFields>({
    defaultValues: getFormDefaultValues(shipment, tenant, parentShipmentId, isCopy),
    resolver: yupResolver(shipmentSchema) as any,
    mode: 'all',
  });

  const { handleSubmit, formState } = formMethods;
  const { isDirty, isValid, isLoading, isSubmitting, dirtyFields } = formState;

  // For a copied shipment, we should only check validity, not dirty state
  const isFormActionable = isCopy ? isValid : isValid && isDirty;

  async function handleFormSubmit(data: ShipmentFields) {
    try {
      if (formMode === 'edit' && shipment) {
        // When cargo items are removed, the cargo array should always be included
        // even if dirtyFields doesn't detect it properly
        const cargoHasChanged = JSON.stringify(shipment.cargo) !== JSON.stringify(data.cargo);

        const dirtyData = Object.keys(data).reduce((acc, key) => {
          if (dirtyFields[key] || (key === 'cargo' && cargoHasChanged)) {
            acc[key] = data[key];
          }
          return acc;
        }, {} as ShipmentFields);

        const payload = transformFormDataToPayload(dirtyData);
        if (parentShipmentId) {
          payload.parentShipmentId = parentShipmentId;
        }

        await updateShipment({ id: shipment.id, ...payload });
        showSuccessToast({ title: `Nalog "${shipment.orderNumber}" uspješno ažuriran` });
        void back();
      } else {
        const payload = transformFormDataToPayload(data);
        if (parentShipmentId) {
          payload.parentShipmentId = parentShipmentId;
        }

        const newShipment = await createShipment(payload);
        showSuccessToast({ title: `Nalog "${newShipment.orderNumber}" uspješno kreiran` });
        await push('/dashboard/shipments');
      }
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Dogodila se greška s unosom naloga. Pokušajte ponovno.' });
    }
  }

  if (isLoading) {
    return <LoadingSpinner size="l" />;
  }

  return (
    <FormProvider {...formMethods}>
      <Box as="form" className="max-w-[1200px]" onSubmit={handleSubmit(handleFormSubmit)}>
        <FlexLayout className="relative flex-col gap-7 w-full">
          <FlexLayout className="flex-row gap-7">
            <FlexLayout className="grow flex-col gap-4">
              <AgencyField />
              <FlexLayout className="gap-4">
                <FlexLayout as="fieldset" className="flex-1 flex-col gap-5">
                  <FlexLayout className="gap-4">
                    <Box className="flex-1">
                      <FormTextInput iconLeft="LockClosedIcon" isDisabled label="Broj naloga" name="orderNumber" />
                    </Box>
                    <Box className="flex-1">
                      <FormTextInput label="Referentni broj" name="cargoReference" placeholder="1234" />
                    </Box>
                  </FlexLayout>
                  <Box className="flex-1">
                    <ContractorField name="transportContractorId" tenant={tenant} />
                  </Box>
                  <FlexLayout className="gap-4">
                    <Box className="flex-1">
                      <ClientField />
                    </Box>
                    <Box className="flex-1">
                      <PriceField />
                    </Box>
                  </FlexLayout>
                </FlexLayout>
                <VerticalDivider />
                <FlexLayout as="fieldset" className="flex-1 flex-col gap-5">
                  <Box className="flex-1">
                    <DriverField />
                  </Box>
                  <FlexLayout className="gap-4">
                    <Box className="flex-1">
                      <VehicleField label="Vozilo" name="vehicleId" placeholder="Odaberi vozilo..." />
                    </Box>
                    <Box className="flex-1">
                      <VehicleField
                        label="Priključno vozilo"
                        name="trailerId"
                        placeholder="Odaberi priključno vozilo..."
                        type={VehicleEnum.TRAILER}
                      />
                    </Box>
                  </FlexLayout>
                  <Box className="flex-1">
                    <DispatcherField />
                  </Box>
                </FlexLayout>
              </FlexLayout>
              <CargoFieldList />
            </FlexLayout>
          </FlexLayout>
          <Box className="sticky bottom-0 bg-[#e9eded] dark:bg-black border-t-[2px] border-dark-200 dark:border-light-700 p-4 -mx-4">
            <Button
              isDisabled={!isFormActionable}
              isFullWidth
              isLoading={isSubmitting}
              text={formMode === 'edit' ? 'Ažuriraj nalog' : 'Napravi nalog'}
              type="submit"
              variant="primary"
            />
          </Box>
        </FlexLayout>
      </Box>
    </FormProvider>
  );
};
