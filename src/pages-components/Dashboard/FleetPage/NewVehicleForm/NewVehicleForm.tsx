import 'dayjs/locale/hr';
import { type Vehicle, VehicleEnum } from '@/lib/api';
import { useCreateVehicle, useUpdateVehicle } from '@/lib/hooks';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';
import { FormProvider, useForm } from 'react-hook-form';

import '@mantine/dates/styles.css';
import { FormDatepicker, FormSingleSelect, FormTextInput, FormYearpicker } from '@/lib/components/form';
import { Box, Button, FlexLayout, Text } from '@/ui';

import { vehicleSchema } from './schema';
import { emissionStandardOptions, formDefaultValues, truckFormDefaultValues, vehicleModelOptions } from './const';

export const NewVehicleForm: React.FC<{ vehicle?: Vehicle }> = ({ vehicle }) => {
  const isEdit = !!vehicle;

  const { push } = useRouter();
  const { mutateAsync: createVehicle } = useCreateVehicle();
  const { mutateAsync: updateVehicle } = useUpdateVehicle(vehicle?.id as string);

  const defaultValues = vehicle ? { ...vehicle } : { ...formDefaultValues, ...truckFormDefaultValues };

  const formMethods = useForm({
    defaultValues,
    resolver: yupResolver(vehicleSchema),
    mode: 'all',
  });

  const { handleSubmit, formState } = formMethods;
  const { isDirty, isValid } = formState;

  async function handleFormSubmit(data: any) {
    try {
      if (isEdit) {
        await updateVehicle({ type: VehicleEnum.TRUCK, ...data });
        await push(`/dashboard/fleet/trucks/${vehicle.id}`);
      } else {
        await createVehicle({ type: VehicleEnum.TRUCK, ...data });
        await push('/dashboard/fleet/trucks');
      }
    } catch (error: any) {
      alert(`Error with form submit. ${error?.message}`);
    }
  }

  return (
    <FormProvider {...formMethods}>
      <FlexLayout as="form" className="gap-[40px]" onSubmit={handleSubmit(handleFormSubmit)}>
        <FlexLayout as="fieldset" className="flex-col gap-4 w-[480px]">
          <Text color="text-color-2" variant="text-m-medium">
            General Info
          </Text>
          <FlexLayout className="gap-4">
            <Box className="flex-1">
              <FormSingleSelect
                label="Brand"
                name="brand"
                isSearchable
                isClearable
                options={vehicleModelOptions}
                placeholder="Select brand..."
              />
            </Box>
            <Box className="flex-1">
              <FormYearpicker name="manufacturingYear" label="Manufacturing Year" />
            </Box>
          </FlexLayout>
          <Box as="hr" className="border-[0px] my-2 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          <Box>
            <FormTextInput name="registration" label="Registration plate" />
          </Box>
          <FlexLayout className="gap-4">
            <Box className="flex-grow">
              <FormDatepicker name="registrationDate" label="Registration date" />
            </Box>
            <Box className="flex-grow">
              <FormDatepicker name="registrationExpiryDate" label="Registration - Expiry date" />
            </Box>
          </FlexLayout>
          <Box as="hr" className="border-[0px] my-2 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          <FlexLayout className="gap-4">
            <Box className="flex-grow">
              <FormTextInput name="emptyWeight" label="Curb Weight" type="number" min="0" />
            </Box>
            <Box className="flex-grow">
              <FormTextInput name="numberOfAxles" label="Number of Axels" type="number" min="0" />
            </Box>
          </FlexLayout>
          <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          <Button
            text={isEdit ? 'Update Truck' : 'Create Truck'}
            isFullWidth
            isDisabled={!(isValid && isDirty)}
            isLoading={formState.isSubmitting}
          />
        </FlexLayout>
        <VehicleInfoForm />
      </FlexLayout>
    </FormProvider>
  );
};

function VehicleInfoForm() {
  return (
    <FlexLayout as="fieldset" className="flex-col gap-4 w-[480px]">
      <Text color="text-color-2" variant="text-m-medium">
        Vehicle Info
      </Text>
      <FlexLayout className="gap-4">
        <Box>
          <FormTextInput name="enginePower" label="Engine Power (kW)" type="number" min="0" />
        </Box>
        <Box className="flex-1">
          <FormSingleSelect
            label="Engine Type"
            name="emissionStandard"
            isSearchable
            isClearable
            options={emissionStandardOptions}
            placeholder="Select engine type..."
          />
        </Box>
      </FlexLayout>
      <Box as="hr" className="border-[0px] my-2 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
      <Box>
        <FormTextInput name="tankSize" label="Tank Size (Liters)" type="number" min="0" />
      </Box>
      <Box>
        <FormTextInput name="averageFuelConsumption" label="Fuel Consumption (l/100km)" type="number" min="0" />
      </Box>
      <Box>
        <FormDatepicker name="tachographExpiryDate" label="Techograph - Expiry date" />
      </Box>
      <Box>
        <FormDatepicker name="fireExtinguisherCheckExpiryDate" label="Fire Extinguisher - Expiry date" />
      </Box>
      <Box>
        <FormDatepicker name="technicalInspectionExpiryDate" label="Techical Inspection - Expiry date" />
      </Box>
      <Box>
        <FormDatepicker name="adrExpiryDate" label="ADR - Expiry date" />
      </Box>
    </FlexLayout>
  );
}
