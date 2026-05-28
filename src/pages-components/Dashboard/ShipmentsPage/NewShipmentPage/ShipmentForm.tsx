import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';

import { type Cargo, type Shipment } from '@/lib/api';
import type { Tenant } from '@/lib/api/tenant.d';
import { FormNumberInput, FormSwitch, FormTextarea, FormTextInput } from '@/lib/components/form';
import { useCreateShipment, useUpdateShipment } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Box, Button, FlexLayout, Icon, LoadingSpinner, Text, Tooltip } from '@/ui';

import { AssignVehicleModal } from './AssignVehicleModal';
import { CargoFieldList } from './CargoFieldList';
import { ClientField } from './ClientField';
import { ContractorField } from './ContractorField';
import { PriceField } from './PriceField';
import { getShipmentSchema } from './schema';
import type { ShipmentFields } from './types';
import { getFormDefaultValues, transformFormDataToPayload } from './utils';

const NoteLabel: React.FC<{ text: string; tooltip: string }> = ({ text, tooltip }) => (
  <Box as="span" className="inline-flex items-center gap-1">
    {text}
    <Tooltip
      content={
        <Box className="px-2 max-w-[260px]">
          <Text as="p" color="text-light-50" variant="text-xxs">
            {tooltip}
          </Text>
        </Box>
      }
      isPortal
    >
      <Icon color="text-color-3" icon="IconInfoCircle" size="s" />
    </Tooltip>
  </Box>
);

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
    id: string;
    orderNumber: string;
    clientId?: string | null;
    cargos: Cargo[];
  } | null>(null);

  const schema = useMemo(() => getShipmentSchema(tenant.id), [tenant.id]);

  const formMethods = useForm<ShipmentFields>({
    defaultValues: getFormDefaultValues(shipment, tenant, isCopy),
    resolver: yupResolver(schema) as any,
    mode: 'all',
  });

  const { handleSubmit, formState } = formMethods;
  const { isDirty, isValid, isLoading, isSubmitting } = formState;

  // For a copied shipment, we should only check validity, not dirty state
  const isFormActionable = isCopy ? isValid : isValid && isDirty;

  async function handleFormSubmit(data: ShipmentFields) {
    try {
      if (isEdit && shipment) {
        const childId = shipment.children?.[0]?.id;
        const wasAgency = !!childId;

        if (wasAgency) {
          // Patch parent and child via their own endpoints. PATCH is partial
          // (FieldState semantics) so the child body carries only the two
          // fields the agency form controls; other child fields stay
          // untouched.
          const { agencyPrice, transportContractorId, isAgency: _ia, ...rest } = data;
          const parentPayload = transformFormDataToPayload({
            ...rest,
            transportContractorId: tenant.id,
          } as ShipmentFields);

          await Promise.all([
            updateShipment({ id: shipment.id, ...parentPayload }),
            updateShipment({
              id: childId,
              price: agencyPrice,
              transportContractorId,
              internalNote: rest.internalNote ?? '',
              externalNote: rest.externalNote ?? '',
            }),
          ]);
        } else {
          const payload = transformFormDataToPayload(data);
          await updateShipment({ id: shipment.id, ...payload });
        }

        showSuccessToast({ title: `Nalog "${shipment.orderNumber}" uspješno ažuriran` });
        void back();
      } else {
        const payload = transformFormDataToPayload(data, { tenantId: tenant.id });

        const newShipment = await createShipment(payload);
        showSuccessToast({ title: `Nalog "${newShipment.orderNumber}" uspješno kreiran` });
        if (data.isAgency) {
          await push('/dashboard/shipments');
          return;
        }
        setAssignVehicleFor({
          id: newShipment.id,
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
    await push(`/dashboard/vehicle-stops/${vehicleId}`);
  }

  return (
    <FormProvider {...formMethods}>
      {assignVehicleFor && (
        <AssignVehicleModal
          cargos={assignVehicleFor.cargos}
          clientId={assignVehicleFor.clientId}
          isOpen={!!assignVehicleFor}
          shipmentId={assignVehicleFor.id}
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
                <AgencyShipmentFields tenant={tenant} />
                <FormTextarea
                  label={
                    <NoteLabel
                      text="Interna napomena"
                      tooltip="Napomena samo za internu upotrebu. Ne pojavljuje se u PDF-ovima ni drugim izlaznim dokumentima."
                    />
                  }
                  name="internalNote"
                />
                <FormTextarea
                  label={
                    <NoteLabel
                      text="Vanjska napomena"
                      tooltip="Napomena vidljiva u PDF-ovima i drugim izlaznim dokumentima koji se šalju vanjskim primateljima."
                    />
                  }
                  name="externalNote"
                />
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

const AgencyShipmentFields: React.FC<{ tenant: Tenant }> = ({ tenant }) => {
  const { setValue, getValues } = useFormContext<ShipmentFields>();
  const isAgency = useWatch<ShipmentFields>({ name: 'isAgency' });
  const price = useWatch<ShipmentFields>({ name: 'price' });
  const agencyPrice = useWatch<ShipmentFields>({ name: 'agencyPrice' });

  useEffect(() => {
    if (isAgency) {
      if (getValues('transportContractorId') === tenant.id) {
        setValue('transportContractorId', '', { shouldDirty: true, shouldValidate: true });
      }
      if (getValues('clientId') === tenant.id) {
        setValue('clientId', '', { shouldDirty: true, shouldValidate: true });
      }
      return;
    }

    const contractorId = getValues('transportContractorId');
    const clientId = getValues('clientId');
    if (contractorId !== tenant.id && clientId !== tenant.id) {
      setValue('transportContractorId', tenant.id, { shouldDirty: true, shouldValidate: true });
    }
  }, [isAgency, tenant.id, getValues, setValue]);

  const ruc = (Number(price) || 0) - (Number(agencyPrice) || 0);

  return (
    <>
      <ContractorField excludeTenant={!!isAgency} name="transportContractorId" tenant={tenant} />
      <FormSwitch label="Agencijski nalog" name="isAgency" />
      {isAgency && (
        <FlexLayout className="gap-4 items-end">
          <Box className="flex-1">
            <FormNumberInput
              iconLeft="IconCurrencyEuro"
              inputMode="decimal"
              label="Cijena agencijskog prijevoza"
              name="agencyPrice"
              placeholder="XXX"
              rules={{ required: true }}
            />
          </Box>
          <FlexLayout className="flex-col flex-1 justify-between items-end">
            <Text color="text-color-3" variant="text-xxs-medium">
              RUC (Razlika u cijeni)
            </Text>
            <Text color={ruc >= 0 ? 'text-green-500' : 'text-red-500'} variant="text-xl-medium">
              {ruc.toFixed(2)} €
            </Text>
          </FlexLayout>
        </FlexLayout>
      )}
    </>
  );
};
