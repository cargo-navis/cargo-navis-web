'use client';

import 'dayjs/locale/hr';
import '@mantine/dates/styles.css';

import { Box, Button } from '@/ui';
import { FormProvider, useForm } from 'react-hook-form';
import { FormCheckboxGroup, FormDatepicker, FormRadioGroup, FormTextInput } from '@/lib/components/form';
import { Employee } from '@/lib/employees';

import { adrOptions, categoryOptions, positionOptions } from './const';
import { createEmployee } from '@/api/employees';

export const NewEmployeeForm: React.FC<{ employee?: Employee }> = ({ employee }) => {
  const isEdit = !!employee;

  const formMethods = useForm({
    defaultValues: employee
  });

  const { watch, handleSubmit, formState } = formMethods;
  const values = watch();

  async function handleFormSubmit(data: any) {
    console.log('form submitted');
    console.log(data);
    await createEmployee();
  }

  return (
    <FormProvider {...formMethods}>
      <Box as="form" className="flex flex-col gap-10" onSubmit={handleSubmit(handleFormSubmit)}>
        <Box className="flex flex-col gap-4 w-[500px]">
          <Box className="flex gap-4">
            <Box className="flex-grow">
              <FormTextInput name="firstName" label="First Name" />
            </Box>
            <Box className="flex-grow">
              <FormTextInput name="lastName" label="Last Name" />
            </Box>
          </Box>
          <Box>
            <FormTextInput name="phoneNumber" label="Phone Number" type="tel" />
          </Box>
          <Box>
            <FormTextInput name="email" label="Email" type="email" />
          </Box>
          <Box>
            <FormTextInput name="governmentId" label="Government ID" />
          </Box>
          <FormRadioGroup name="position" label="Position" options={positionOptions} />
          {values?.position === 'driver' && (
            <Box className="flex flex-col gap-4">
              <Box className="flex gap-3">
                <Box className="flex-1">
                  <FormCheckboxGroup name="driverLicenceCategories" label="Categories" options={categoryOptions} />
                </Box>
                <Box className="flex-1">
                  <FormRadioGroup name="adr" label="ADR" options={adrOptions} />
                </Box>
              </Box>
              <FormDatepicker name="driverLicenceExpirationDate" label="Expiry Date" />
            </Box>
          )}
          <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25"/>
          <Button text={isEdit ? "Update Employee" : "Create Employee"} isFullWidth isDisabled={!formState.isDirty} isLoading={formState.isSubmitting} />
        </Box>
        {/*<Box as="pre" className="absolute right-[600px]">*/}
        {/*  {JSON.stringify(values, null, 2)}*/}
        {/*</Box>*/}
      </Box>
    </FormProvider>
  );
}