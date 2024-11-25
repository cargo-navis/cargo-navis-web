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
  const buttonText = isEdit ? `Ažuriraj ${vehicleTypeName}` : `Dodaj ${vehicleTypeName}`;

  return (
    <FormProvider {...formMethods}>
      <FlexLayout as="form" className="gap-[40px]" onSubmit={handleSubmit(handleFormSubmit)}>
        <FlexLayout as="fieldset" className="flex-col gap-4 w-[480px]">
          <Text color="text-color-2" variant="text-m-medium">
            Generalni podaci
          </Text>
          <FlexLayout className="gap-4">
            <Box className="flex-1">
              <FormSingleSelect
                label="Brend"
                name="brand"
                isSearchable
                isClearable
                options={brandOptions}
                placeholder="Select brand..."
              />
            </Box>
            <Box className="flex-1">
              <FormYearpicker name="manufacturingYear" label="Godina proizvodnje" />
            </Box>
          </FlexLayout>
          <Box as="hr" className="border-[0px] my-2 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          <Box>
            <FormTextInput name="registration" label="Registracija" />
          </Box>
          <FlexLayout className="gap-4">
            <Box className="flex-grow">
              <FormTextInput name="emptyWeight" label="Masa praznog vozila (kg)" type="number" min="0" />
            </Box>
            <Box className="flex-grow">
              <FormTextInput name="numberOfAxles" label="Broj osovina" type="number" min="0" />
            </Box>
          </FlexLayout>
          <Box>
            <FormTextInput name="vehicleIdentificationNumber" label="Broj šasije" />
          </Box>
          <Box as="hr" className="border-[0px] my-2 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          <FlexLayout className="gap-4">
            <Box className="flex-1">
              <FormDatepicker name="registrationDate" label="Datum registracije" />
            </Box>
            <Box className="flex-1">
              <FormDatepicker name="registrationExpiryDate" label="Registracija - Vrijedi do" />
            </Box>
          </FlexLayout>
          <Box as="hr" className="border-[0px] my-2 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          <DisplayIf condition={type !== VehicleEnum.TRAILER}>
            <Box>
              <FormDatepicker name="tachographExpiryDate" label="Tahograf - Vrijedi do" />
            </Box>
            <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          </DisplayIf>
          <Box>
            <FormDatepicker name="technicalInspectionExpiryDate" label="Tehnički pregled - Vrijedi do" />
          </Box>
          <Box>
            <FormDatepicker
              name="periodicalTechnicalInspectionExpiryDate"
              label="Periodički tehnički pregled - Vrijedi do"
            />
          </Box>
          <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          <FlexLayout className="gap-4">
            <Box className="flex-1">
              <FormDatepicker name="smallServiceExpiryDate" label="Mali servis - Vrijedi do" />
            </Box>
            <Box className="flex-1">
              <FormDatepicker name="bigServiceExpiryDate" label="Veliki servis - Vrijedi do" />
            </Box>
          </FlexLayout>
          <Box>
            <FormDatepicker name="tiresReplacementExpiryDate" label="Gume - Vrijedi do" />
          </Box>
          <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          <FlexLayout className="gap-4">
            <Box className="flex-1">
              <FormDatepicker name="mandatoryInsuranceExpiryDate" label="Osiguranje - Vrijedi do" />
            </Box>
            <Box className="flex-1">
              <FormDatepicker name="optionalInsuranceExpiryDate" label="Kasko - Vrijedi do" />
            </Box>
          </FlexLayout>
          <Box>
            <FormDatepicker name="leasingExpiryDate" label="Leasing - Vrijedi do" />
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
