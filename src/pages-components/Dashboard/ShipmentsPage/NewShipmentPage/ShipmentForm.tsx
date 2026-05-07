import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { type Cargo, type Shipment } from '@/lib/api';
import type { Tenant } from '@/lib/api/tenant.d';
import { FormTextInput } from '@/lib/components/form';
import { useCreateShipment, useUpdateShipment } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Box, Button, FlexLayout, LoadingSpinner } from '@/ui';

import { AssignVehicleModal } from './AssignVehicleModal';
import { CargoFieldList } from './CargoFieldList';
import { ClientField } from './ClientField';
import { ContractorField } from './ContractorField';
import { PriceField } from './PriceField';
import { shipmentSchema } from './schema';
import type { ShipmentFields } from './types';
import { getFormDefaultValues, transformFormDataToPayload } from './utils';

interface ShipmentFormProps {
  shipment?: Shipment;
  tenant: Tenant;
  copyFromId?: string;
}

export const ShipmentForm: React.FC<ShipmentFormProps> = ({ shipment, tenant, copyFromId }) => {
  const { push, back } = useRouter();
  const isShipmentPresent = !!shipment;
  const isCopy = !!copyFromId;

  // When copying, we use the shipment data but treat it as a new form (not an edit)
  const formMode = isShipmentPresent && !isCopy ? 'edit' : 'new';
  const isEdit = formMode === 'edit';

  const { mutateAsync: createShipment } = useCreateShipment();
  const { mutateAsync: updateShipment } = useUpdateShipment();

  const [assignVehicleFor, setAssignVehicleFor] = useState<{
    orderNumber: string;
    clientId?: string | null;
    cargos: Cargo[];
  } | null>(null);

  const formMethods = useForm<ShipmentFields>({
    defaultValues: getFormDefaultValues(shipment, tenant, isCopy),
    resolver: yupResolver(shipmentSchema) as any,
    mode: 'all',
  });

  const { handleSubmit, formState } = formMethods;
  const { isDirty, isValid, isLoading, isSubmitting, dirtyFields } = formState;

  // For a copied shipment, we should only check validity, not dirty state
  const isFormActionable = isCopy ? isValid : isValid && isDirty;

  async function handleFormSubmit(data: ShipmentFields) {
    try {
      if (isEdit && shipment) {
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

        await updateShipment({ id: shipment.id, ...payload });
        showSuccessToast({ title: `Nalog "${shipment.orderNumber}" uspješno ažuriran` });
        void back();
      } else {
        const payload = transformFormDataToPayload(data);

        const newShipment = await createShipment(payload);
        showSuccessToast({ title: `Nalog "${newShipment.orderNumber}" uspješno kreiran` });
        setAssignVehicleFor({
          orderNumber: newShipment.orderNumber,
          clientId: newShipment.clientId,
          cargos: newShipment.cargo,
        });
      }
    } catch (error) {
      console.error(error);
      showErrorToast({ title: 'Dogodila se greška s unosom naloga. Pokušajte ponovno.' });
    }
  }

  if (isLoading) {
    return <LoadingSpinner size="l" />;
  }

  async function handleAssignDismiss() {
    setAssignVehicleFor(null);
    await push('/dashboard/shipments');
  }

  async function handleVehicleAssigned(vehicleId: string) {
    setAssignVehicleFor(null);
    await push(`/dashboard/vehicle-stops/${vehicleId}`);
  }

  return (
    <FormProvider {...formMethods}>
      {assignVehicleFor && (
        <AssignVehicleModal
          cargos={assignVehicleFor.cargos}
          clientId={assignVehicleFor.clientId}
          isOpen={!!assignVehicleFor}
          shipmentOrderNumber={assignVehicleFor.orderNumber}
          onAssigned={handleVehicleAssigned}
          onClose={handleAssignDismiss}
        />
      )}
      <Box as="form" className="max-w-[1400px]" onSubmit={handleSubmit(handleFormSubmit)}>
        <FlexLayout className="relative flex-col gap-7 w-full">
          <FlexLayout className="flex-row gap-7">
            <FlexLayout className="w-[500px] flex-col gap-4">
              <FlexLayout as="fieldset" className="flex-1 flex-col gap-5">
                <FormTextInput label="Vanjska referenca narudžbe" name="externalOrderReference" />
                <FlexLayout className="gap-4">
                  <Box className="flex-1">
                    <ClientField />
                  </Box>
                  <Box className="flex-1">
                    <PriceField />
                  </Box>
                </FlexLayout>
                <ContractorField name="transportContractorId" tenant={tenant} />
              </FlexLayout>
            </FlexLayout>
            <CargoFieldList />
          </FlexLayout>
          <Box className="sticky bottom-0 bg-[#e9eded] dark:bg-black border-t-[2px] border-dark-200 dark:border-light-700 p-4 -mx-4">
            <Button
              isDisabled={!isFormActionable}
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
