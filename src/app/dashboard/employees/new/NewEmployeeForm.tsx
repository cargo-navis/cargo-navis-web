'use client';

import 'dayjs/locale/hr';
import '@mantine/dates/styles.css';

import { Box, Button, Text } from '@/ui';
import { FormProvider, useForm } from 'react-hook-form';
import { FormCheckboxGroup, FormDatepicker, FormRadioGroup, FormTextInput } from '@/lib/components/form';
import { Employee } from '@/lib/employees';

import { adrOptions, categoryOptions, positionOptions } from './const';
import { createEmployee } from '@/api/employees';
import clsx from 'clsx';

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
      <Box as="form" className="flex gap-[40px]" onSubmit={handleSubmit(handleFormSubmit)}>
        <Box className="flex flex-col gap-4 w-[500px]">
          <Box className="flex gap-4">
            <Box className="flex-grow">
              <FormTextInput name="firstName" label="First Name"/>
            </Box>
            <Box className="flex-grow">
              <FormTextInput name="lastName" label="Last Name"/>
            </Box>
          </Box>
          <Box>
            <FormTextInput name="phoneNumber" label="Phone Number" type="tel"/>
          </Box>
          <Box>
            <FormTextInput name="email" label="Email" type="email"/>
          </Box>
          <FormRadioGroup name="position" label="Position" options={positionOptions}/>
          <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25"/>
          <Button
            text={isEdit ? "Update Employee" : "Create Employee"}
            isFullWidth
            isDisabled={!formState.isDirty}
            isLoading={formState.isSubmitting}
          />
        </Box>
        {values?.position === 'driver' && (
          <>
            <Box className="w-[1px] border-[0px] border-l-[1px] border-light-200 dark:border-white-alpha-25" />
            <Box className={clsx(
              "w-[500px] relative flex flex-col gap-4",
            )}>
              <Text color="text-color-2" variant="text-l-medium">Driver details</Text>
              <Box>
                <FormTextInput name="governmentId" label="Government ID"/>
              </Box>
              <Box className="flex gap-3">
                <Box className="flex-1">
                  <FormCheckboxGroup name="driverLicenceCategories" label="Categories" options={categoryOptions}/>
                </Box>
                <Box className="flex-1">
                  <FormRadioGroup name="adr" label="ADR" options={adrOptions}/>
                </Box>
              </Box>
              <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25"/>
              <Box className="flex flex-col gap-2">
                <Text className="uppercase" color="text-color-3" variant="text-xs-medium">Driver&apos;s Licence</Text>
                <FormDatepicker name="driverLicenceExpirationDate" label="Expiration date"/>
                {/* + TIP VOZACKE (koja drzava)*/}
              </Box>
              <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25"/>
              <Box className="flex flex-col gap-2">
                <Text className="uppercase" color="text-color-3" variant="text-xs-medium">Employment Contract</Text>
                <FormDatepicker name="employmentExpirationDate" label="Expiration date"/>
              </Box>
              <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25"/>
              <Box className="flex flex-col gap-2">
                <Text className="uppercase" color="text-color-3" variant="text-xs-medium">Medical Exam</Text>
                <FormDatepicker name="medicalExpirationDate" label="Expiration date"/>
              </Box>
              <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25"/>
              <Box className="flex flex-col gap-2">
                <Text className="uppercase" color="text-color-3" variant="text-xs-medium">Working Visa</Text>
                <FormDatepicker name="visaExpirationDate" label="Expiration date"/>
              </Box>
            </Box>
          </>
        )}
      </Box>
      {/*<Box as="pre" className="absolute right-[600px]">*/}
      {/*  {JSON.stringify(values, null, 2)}*/}
      {/*</Box>*/}
    </FormProvider>
  );
}