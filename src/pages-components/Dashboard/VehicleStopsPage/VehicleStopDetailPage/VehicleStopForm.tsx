import { yupResolver } from '@hookform/resolvers/yup';
import { useEffect } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';

import { PostalCodeSelectField } from '@/components/postalCodes/PostalCodeSelectField';
import type { Vehicle } from '@/lib/api';
import type { Employee } from '@/lib/api/employees.d';
import type { VehicleStop } from '@/lib/api/vehicleStops';
import { FormDatepicker, FormSingleSelect, FormTextInput } from '@/lib/components/form';
import { useCreateVehicleStop, useDispatchers, useDrivers, useTrailers, useUpdateVehicleStop } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { countryEuropeOptions } from '@/pages-components/Dashboard/NewEmployeePage/const';
import { Box, Button, FlexLayout } from '@/ui';

import {
  getVehicleStopFormDefaults,
  vehicleStopDefaultValues,
  type VehicleStopFormValues,
  vehicleStopSchema,
} from './schema';

interface VehicleStopFormProps {
  vehicleId: string;
  stop?: VehicleStop;
  onSuccess(): void;
  onDirtyChange?(isDirty: boolean): void;
}

export const VehicleStopForm = ({ vehicleId, stop, onSuccess, onDirtyChange }: VehicleStopFormProps) => {
  const isEditMode = !!stop;

  const { data: drivers = [] } = useDrivers();
  const { data: dispatchers = [] } = useDispatchers();
  const { trailers = [] } = useTrailers();

  const { mutateAsync: createStop, isPending: isCreating } = useCreateVehicleStop();
  const { mutateAsync: updateStop, isPending: isUpdating } = useUpdateVehicleStop();

  const formMethods = useForm<VehicleStopFormValues>({
    defaultValues: stop ? getVehicleStopFormDefaults(stop) : vehicleStopDefaultValues,
    resolver: yupResolver(vehicleStopSchema) as any,
    mode: 'onChange',
  });

  const { handleSubmit, formState } = formMethods;

  useEffect(() => {
    onDirtyChange?.(formState.isDirty);
  }, [formState.isDirty, onDirtyChange]);

  const driverOptions = drivers.map((d: Employee) => ({ value: d.id, label: d.fullName }));
  const dispatcherOptions = dispatchers.map((d: Employee) => ({ value: d.id, label: d.fullName }));
  const trailerOptions = trailers.map((t: Vehicle) => ({ value: t.id, label: t.registration }));

  async function handleFormSubmit(values: VehicleStopFormValues) {
    const payload = {
      address: {
        streetName: values.address.streetName,
        postalCodeId: values.address.addressPostalCode.value as string,
      },
      date: values.date || null,
      driverId: values.driverId || null,
      trailerId: values.trailerId || null,
      disponentId: values.disponentId || null,
    };

    try {
      if (isEditMode) {
        await updateStop({ id: stop.id, data: payload });
        showSuccessToast({ title: 'Stanica ažurirana' });
      } else {
        await createStop({ vehicleId, ...payload });
        showSuccessToast({ title: 'Stanica kreirana' });
      }
      onSuccess();
    } catch {
      showErrorToast({ title: isEditMode ? 'Greška s ažuriranjem stanice' : 'Greška s kreiranjem stanice' });
    }
  }

  return (
    <FormProvider {...formMethods}>
      <FlexLayout as="form" className="flex-col gap-4" onSubmit={handleSubmit(handleFormSubmit)}>
        <FormTextInput autoFocus label="Ulica i broj" name="address.streetName" rules={{ required: true }} />
        <FlexLayout className="gap-4">
          <Box className="flex-1">
            <FormSingleSelect
              isSearchable
              label="Država"
              name="address.countryCode"
              options={countryEuropeOptions}
              rules={{ required: true }}
            />
          </Box>
          <Box className="flex-1">
            <PostalCodeField />
          </Box>
        </FlexLayout>
        <FormDatepicker label="Datum" name="date" />
        <FlexLayout className="gap-4">
          <Box className="flex-1">
            <FormSingleSelect isClearable isSearchable label="Vozač" name="driverId" options={driverOptions} />
          </Box>
          <Box className="flex-1">
            <FormSingleSelect
              isClearable
              isSearchable
              label="Disponent"
              name="disponentId"
              options={dispatcherOptions}
            />
          </Box>
        </FlexLayout>
        <FormSingleSelect isClearable isSearchable label="Prikolica" name="trailerId" options={trailerOptions} />
        <Box className="mt-4">
          <Button
            isDisabled={!formState.isValid || (isEditMode && !formState.isDirty)}
            isFullWidth
            isLoading={isCreating || isUpdating}
            text={isEditMode ? 'Spremi promjene' : 'Spremi stanicu'}
          />
        </Box>
      </FlexLayout>
    </FormProvider>
  );
};

const PostalCodeField = () => {
  const { watch } = useFormContext();
  const countryCode = watch('address.countryCode');

  return (
    <PostalCodeSelectField
      countryCode={countryCode}
      iconLeft="MagnifyingGlassIcon"
      isClearable
      isDisabled={!countryCode}
      label="Poštanski broj"
      name="address.addressPostalCode"
      placeholder="Odaberi poštanski broj"
      rules={{ required: true }}
    />
  );
};
