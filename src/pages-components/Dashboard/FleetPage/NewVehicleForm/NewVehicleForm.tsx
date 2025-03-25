import 'dayjs/locale/hr';
import '@mantine/dates/styles.css';

import { useRouter } from 'next/router';
import { FormProvider, useForm } from 'react-hook-form';

import { type Vehicle, VehicleEnum } from '@/lib/api/vehicles';
import { FormDatepicker, FormSingleSelect, FormTextInput, FormYearpicker } from '@/lib/components/form';
import { useCreateVehicle, useUpdateVehicle } from '@/lib/hooks';
import { Box, Button, DisplayIf, FlexLayout, Text } from '@/ui';

import { typeBrandOptionsMap, typeNameMap } from './const';
import { LoadingSpaceFields } from './LoadingSpaceFields';
import { getDefaultValues, getEditDefaultValues, processFormData } from './utils';
import { VehicleInfoFields } from './VehicleInfoFields';

export const NewVehicleForm: React.FC<{ vehicle?: Vehicle; type: VehicleEnum }> = ({ vehicle, type }) => {
  const isEdit = !!vehicle;

  const { back } = useRouter();
  const { mutateAsync: createVehicle } = useCreateVehicle();
  const { mutateAsync: updateVehicle } = useUpdateVehicle(vehicle?.id as string);

  const defaultValues = vehicle ? getEditDefaultValues(vehicle) : getDefaultValues(type);

  const formMethods = useForm<any>({
    defaultValues,
    // resolver: yupResolver(getSchemaForType(type)), // TODO - fix schema
    mode: 'all',
  });

  const { handleSubmit, formState } = formMethods;
  const { isDirty, isValid } = formState;

  async function handleFormSubmit(data: any) {
    const processedData = processFormData(data, type);

    const updatedFields = Object.keys(processedData).reduce(
      (acc, key) => {
        if (formState.dirtyFields[key]) {
          acc[key] = processedData[key];
        }
        return acc;
      },
      {} as Record<string, any>
    );

    try {
      if (isEdit) {
        await updateVehicle({ type, ...updatedFields });
        void back();
      } else {
        await createVehicle({ type, ...updatedFields });
        void back();
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
                isClearable
                isSearchable
                label="Brend"
                name="brand"
                options={brandOptions}
                placeholder="Select brand..."
              />
            </Box>
            <Box className="flex-1">
              <FormYearpicker label="Godina proizvodnje" name="manufacturingYear" />
            </Box>
          </FlexLayout>
          <Box as="hr" className="border-[0px] my-2 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          <Box>
            <FormTextInput label="Registracija" name="registration" />
          </Box>
          <FlexLayout className="gap-4">
            <Box className="flex-grow">
              <FormTextInput label="Masa praznog vozila (kg)" min="0" name="emptyWeight" type="number" />
            </Box>
            <Box className="flex-grow">
              <FormTextInput label="Broj osovina" min="0" name="numberOfAxles" type="number" />
            </Box>
          </FlexLayout>
          <Box>
            <FormTextInput label="Broj šasije" name="vehicleIdentificationNumber" />
          </Box>
          <Box as="hr" className="border-[0px] my-2 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          <FlexLayout className="gap-4">
            <Box className="flex-1">
              <FormDatepicker label="Datum registracije" name="registrationDate" />
            </Box>
            <Box className="flex-1">
              <FormDatepicker label="Registracija - Vrijedi do" name="registrationExpiryDate" />
            </Box>
          </FlexLayout>
          <Box as="hr" className="border-[0px] my-2 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          <DisplayIf condition={type !== VehicleEnum.TRAILER}>
            <Box>
              <FormDatepicker label="Tahograf - Vrijedi do" name="tachographExpiryDate" />
            </Box>
            <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          </DisplayIf>
          <Box>
            <FormDatepicker label="Tehnički pregled - Vrijedi do" name="technicalInspectionExpiryDate" />
          </Box>
          <Box>
            <FormDatepicker
              label="Periodički tehnički pregled - Vrijedi do"
              name="periodicalTechnicalInspectionExpiryDate"
            />
          </Box>
          <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          <FlexLayout className="gap-4">
            <Box className="flex-1">
              <FormDatepicker label="Mali servis - Vrijedi do" name="smallServiceExpiryDate" />
            </Box>
            <Box className="flex-1">
              <FormDatepicker label="Veliki servis - Vrijedi do" name="bigServiceExpiryDate" />
            </Box>
          </FlexLayout>
          <Box>
            <FormDatepicker label="Gume - Vrijedi do" name="tiresReplacementExpiryDate" />
          </Box>
          <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          <FlexLayout className="gap-4">
            <Box className="flex-1">
              <FormDatepicker label="Osiguranje - Vrijedi do" name="mandatoryInsuranceExpiryDate" />
            </Box>
            <Box className="flex-1">
              <FormDatepicker label="Kasko - Vrijedi do" name="optionalInsuranceExpiryDate" />
            </Box>
          </FlexLayout>
          <Box>
            <FormDatepicker label="Leasing - Vrijedi do" name="leasingExpiryDate" />
          </Box>
          <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          <Button isDisabled={!(isValid && isDirty)} isFullWidth isLoading={formState.isSubmitting} text={buttonText} />
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
