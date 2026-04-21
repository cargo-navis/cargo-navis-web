import { yupResolver } from '@hookform/resolvers/yup';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';

import { PostalCodeSelectField } from '@/components/postalCodes/PostalCodeSelectField';
import type { Vehicle } from '@/lib/api';
import type { Employee } from '@/lib/api/employees.d';
import { FormDatepicker, FormSingleSelect, FormTextInput } from '@/lib/components/form';
import { useCreateVehicleStop, useDispatchers, useDrivers, useTrailers } from '@/lib/hooks';
import { countryEuropeOptions } from '@/pages-components/Dashboard/NewEmployeePage/const';
import { Box, Button, FlexLayout } from '@/ui';

import { vehicleStopDefaultValues, type VehicleStopFormValues, vehicleStopSchema } from './schema';

interface VehicleStopFormProps {
  vehicleId: string;
  onSuccess(): void;
}

export const VehicleStopForm = ({ vehicleId, onSuccess }: VehicleStopFormProps) => {
  const { data: drivers = [] } = useDrivers();
  const { data: dispatchers = [] } = useDispatchers();
  const { trailers = [] } = useTrailers();

  const { mutateAsync: createStop, isPending } = useCreateVehicleStop();

  const formMethods = useForm<VehicleStopFormValues>({
    defaultValues: vehicleStopDefaultValues,
    resolver: yupResolver(vehicleStopSchema) as any,
    mode: 'onChange',
  });

  const { handleSubmit, formState } = formMethods;

  const driverOptions = drivers.map((d: Employee) => ({ value: d.id, label: d.fullName }));
  const dispatcherOptions = dispatchers.map((d: Employee) => ({ value: d.id, label: d.fullName }));
  const trailerOptions = trailers.map((t: Vehicle) => ({ value: t.id, label: t.registration }));

  async function handleFormSubmit(values: VehicleStopFormValues) {
    await createStop({
      vehicleId,
      address: {
        streetName: values.address.streetName,
        postalCodeId: values.address.addressPostalCode.value as string,
      },
      date: values.date || null,
      driverId: values.driverId || null,
      trailerId: values.trailerId || null,
      disponentId: values.disponentId || null,
    });
    onSuccess();
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
          <Button isDisabled={!formState.isValid} isFullWidth isLoading={isPending} text="Spremi stanicu" />
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
