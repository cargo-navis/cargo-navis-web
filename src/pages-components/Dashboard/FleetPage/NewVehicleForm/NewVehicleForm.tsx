import 'dayjs/locale/hr';
import { type Vehicle, VehicleEnum } from '@/lib/api';
import { FormDatepicker, FormSingleSelect, FormTextInput, FormYearpicker } from '@/lib/components/form';
import { useCreateVehicle, useUpdateVehicle } from '@/lib/hooks';
import { Box, Button, DisplayIf, FlexLayout, Text } from '@/ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';
import { FormProvider, useForm } from 'react-hook-form';
import { VehicleInfoForm } from './VehicleInfoForm';

import '@mantine/dates/styles.css';

import { formDefaultValues, truckFormDefaultValues, typeBrandOptionsMap } from './const';
import { vehicleSchema } from './schema';

export const NewVehicleForm: React.FC<{ vehicle?: Vehicle; type: VehicleEnum }> = ({ vehicle, type }) => {
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

  const brandOptions = typeBrandOptionsMap[type];

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
                options={brandOptions}
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
              <FormTextInput name="emptyWeight" label="Curb Weight" type="number" min="0" />
            </Box>
            <Box className="flex-grow">
              <FormTextInput name="numberOfAxles" label="Number of Axels" type="number" min="0" />
            </Box>
          </FlexLayout>
          <Box as="hr" className="border-[0px] my-2 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          <FlexLayout className="gap-4">
            <Box className="flex-grow">
              <FormDatepicker name="registrationDate" label="Registration date" />
            </Box>
            <Box className="flex-grow">
              <FormDatepicker name="registrationExpiryDate" label="Registration - Expiry date" />
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
        <DisplayIf condition={type === VehicleEnum.TRUCK}>
          <VehicleInfoForm />
        </DisplayIf>
      </FlexLayout>
    </FormProvider>
  );
};
