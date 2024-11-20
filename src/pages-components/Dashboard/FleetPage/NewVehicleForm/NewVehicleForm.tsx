import 'dayjs/locale/hr';
import { vehicleTypeToPathMap } from '@/components/AlertMenu/utils';
import { type Vehicle, VehicleEnum } from '@/lib/api';
import { FormDatepicker, FormSingleSelect, FormTextInput, FormYearpicker } from '@/lib/components/form';
import { useCreateVehicle, useUpdateVehicle } from '@/lib/hooks';
import { Box, Button, DisplayIf, FlexLayout, Text } from '@/ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';
import { FormProvider, useForm } from 'react-hook-form';

import { LoadingSpaceFields } from './LoadingSpaceFields';
import { typeBrandOptionsMap, typeNameMap } from './const';
import { getSchemaForType } from './schema';
import { getDefaultValues, getEditDefaultValues, processFormData } from './utils';

import '@mantine/dates/styles.css';
import { VehicleInfoFields } from './VehicleInfoFields';

export const NewVehicleForm: React.FC<{ vehicle?: Vehicle; type: VehicleEnum }> = ({ vehicle, type }) => {
  const isEdit = !!vehicle;

  const { push } = useRouter();
  const { mutateAsync: createVehicle } = useCreateVehicle();
  const { mutateAsync: updateVehicle } = useUpdateVehicle(vehicle?.id as string);

  const defaultValues = vehicle ? getEditDefaultValues(vehicle) : getDefaultValues(type);

  const formMethods = useForm({
    defaultValues,
    resolver: yupResolver(getSchemaForType(type)),
    mode: 'all',
  });

  const { handleSubmit, formState } = formMethods;
  const { isDirty, isValid } = formState;

  async function handleFormSubmit(data: any) {
    const processedData = processFormData(data, type);
    const vehicleSegmentPath = vehicleTypeToPathMap[type];

    try {
      if (isEdit) {
        await updateVehicle({ type, ...processedData });
        await push(`/dashboard/fleet/${vehicleSegmentPath}/${vehicle.id}`);
      } else {
        await createVehicle({ type, ...processedData });
        await push(`/dashboard/fleet/${vehicleSegmentPath}`);
      }
    } catch (error: any) {
      alert(`Error with form submit. ${error?.message}`);
    }
  }

  const brandOptions = typeBrandOptionsMap[type];

  const vehicleTypeName = typeNameMap[type];
  const buttonText = isEdit ? `Update ${vehicleTypeName}` : `Create ${vehicleTypeName}`;

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
            <Box className="flex-1">
              <FormDatepicker name="registrationDate" label="Registration date" />
            </Box>
            <Box className="flex-1">
              <FormDatepicker name="registrationExpiryDate" label="Registration - Expiry date" />
            </Box>
          </FlexLayout>
          <Box as="hr" className="border-[0px] my-2 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          <DisplayIf condition={type !== VehicleEnum.TRAILER}>
            <Box>
              <FormDatepicker name="tachographExpiryDate" label="Tachograph - Expiry date" />
            </Box>
            <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          </DisplayIf>
          <Box>
            <FormDatepicker name="technicalInspectionExpiryDate" label="Techical Inspection - Expiry date" />
          </Box>
          <Box>
            <FormDatepicker
              name="periodicalTechnicalInspectionExpiryDate"
              label="Periodical Techical Inspection - Expiry date"
            />
          </Box>
          <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          <FlexLayout className="gap-4">
            <Box className="flex-1">
              <FormDatepicker name="smallServiceExpiryDate" label="Small Service - Expiry date" />
            </Box>
            <Box className="flex-1">
              <FormDatepicker name="bigServiceExpiryDate" label="Big Service - Expiry date" />
            </Box>
          </FlexLayout>
          <Box>
            <FormDatepicker name="tiresSeasonalReplacementExpiryDate" label="Tires Seasonal Change - Expiry date" />
          </Box>
          <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          <Box>
            <FormDatepicker name="insuranceExpiryDate" label="Insurance - Expiry date" />
          </Box>
          <Box>
            <FormDatepicker name="leasingExpiryDate" label="Leasing - Expiry date" />
          </Box>
          <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          <Button text={buttonText} isFullWidth isDisabled={!(isValid && isDirty)} isLoading={formState.isSubmitting} />
        </FlexLayout>
        <DisplayIf condition={type !== VehicleEnum.TRAILER}>
          <VehicleInfoFields />
        </DisplayIf>
        <DisplayIf condition={type !== VehicleEnum.TRUCK}>
          <LoadingSpaceFields type={type} />
        </DisplayIf>
      </FlexLayout>
    </FormProvider>
  );
};
