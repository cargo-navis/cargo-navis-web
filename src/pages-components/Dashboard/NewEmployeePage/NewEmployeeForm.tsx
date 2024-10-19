import 'dayjs/locale/hr';
import { FormSingleSelect } from '@/lib/components/form/FormSingleSelect';
import { yupResolver } from '@hookform/resolvers/yup';
import clsx from 'clsx';
import { useRouter } from 'next/router';
import { FormProvider, useForm } from 'react-hook-form';

import type { Employee } from '@/lib/api/employees.d';
import '@mantine/dates/styles.css';
import { FormCheckboxGroup, FormDatepicker, FormRadioGroup, FormTextInput } from '@/lib/components/form';
import { Box, Button, Text } from '@/ui';

import { useCreateEmployee, useUpdateEmployee } from '@/lib/hooks';
import {
  adrOptions,
  categoryOptions,
  countryOptions,
  formDefaultValues,
  genderOptions,
  positionOptions,
} from './const';
import { employeeSchema } from './schema';

export const NewEmployeeForm: React.FC<{ employee?: Employee }> = ({ employee }) => {
  const { push } = useRouter();
  const isEdit = !!employee;

  const { mutateAsync: createEmployee } = useCreateEmployee();
  const { mutateAsync: updateEmployee } = useUpdateEmployee(employee?.id as string);

  const defaultValues = employee ? { ...employee } : formDefaultValues;

  const formMethods = useForm({
    defaultValues,
    resolver: yupResolver(employeeSchema),
    mode: 'all',
  });

  const { watch, handleSubmit, formState } = formMethods;
  const { isDirty, isValid } = formState;
  const values = watch();

  async function handleFormSubmit(data: any) {
    try {
      if (isEdit) {
        await updateEmployee(data);
        await push(`/dashboard/employees/${employee.id}`);
      } else {
        await createEmployee(data);
        await push('/dashboard/employees');
      }
    } catch (error: any) {
      alert(`Error with form submit. ${error?.message}`);
    }
  }

  return (
    <FormProvider {...formMethods}>
      <Box as="form" className="flex gap-[40px]" onSubmit={handleSubmit(handleFormSubmit)}>
        <Box className="flex flex-col gap-4 w-[480px]">
          <Box className="flex gap-4">
            <Box className="flex-grow">
              <FormTextInput name="firstName" label="First Name" />
            </Box>
            <Box className="flex-grow">
              <FormTextInput name="lastName" label="Last Name" />
            </Box>
          </Box>
          <Box className="flex-1">
            <FormRadioGroup name="gender" label="Gender" options={genderOptions} />
          </Box>
          <Box>
            <FormTextInput name="phoneNumber" label="Phone Number" type="tel" />
          </Box>
          <Box>
            <FormTextInput name="email" label="Email" type="email" />
          </Box>
          <FormRadioGroup name="position" label="Position" options={positionOptions} />
          <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          <Button
            text={isEdit ? 'Update Employee' : 'Create Employee'}
            isFullWidth
            isDisabled={!(isValid && isDirty)}
            isLoading={formState.isSubmitting}
          />
        </Box>
        {values?.position === 'driver' && (
          <>
            <Box className="w-[1px] border-[0px] border-l-[1px] border-light-200 dark:border-white-alpha-25" />
            <Box className={clsx('w-[480px] relative flex flex-col gap-4')}>
              <Text color="text-color-2" variant="text-l-medium">
                Driver details
              </Text>
              <Box>
                <FormTextInput name="governmentId" label="Government ID" />
              </Box>
              <Box className="flex gap-3">
                <Box className="flex-1">
                  <FormCheckboxGroup name="driverLicenceCategories" label="Categories" options={categoryOptions} />
                </Box>
                <Box className="flex-1">
                  <FormRadioGroup name="adr" label="ADR" options={adrOptions} />
                </Box>
              </Box>
              <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
              <Box className="flex flex-col gap-2">
                <Text className="uppercase" color="text-color-3" variant="text-xs-medium">
                  Driver&apos;s Licence
                </Text>
                <FormDatepicker name="driverLicenceExpiryDate" label="Expiration date (Regular)" />
                <FormDatepicker name="professionalDriverLicenceExpiryDate" label="Expiration date (Professional)" />
                <FormSingleSelect
                  label="Country of issue"
                  name="nationality"
                  isSearchable
                  isClearable
                  options={countryOptions}
                  placeholder="Select country..."
                />
              </Box>
              <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
              <Box className="flex flex-col gap-2">
                <Text className="uppercase" color="text-color-3" variant="text-xs-medium">
                  Employment Contract
                </Text>
                <FormDatepicker name="contractExpiryDate" label="Expiration date" />
              </Box>
              <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
              <Box className="flex flex-col gap-2">
                <Text className="uppercase" color="text-color-3" variant="text-xs-medium">
                  Medical Exam
                </Text>
                <FormDatepicker name="medicalExaminationExpiryDate" label="Expiration date" />
              </Box>
              <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
              <Box className="flex flex-col gap-2">
                <Text className="uppercase" color="text-color-3" variant="text-xs-medium">
                  Working Visa
                </Text>
                <FormDatepicker name="visaExpiryDate" label="Expiration date" />
              </Box>
            </Box>
          </>
        )}
      </Box>
      {/*<Box as="pre" className="absolute right-[600px] text-color-2">*/}
      {/*  {JSON.stringify(values, null, 2)}*/}
      {/*</Box>*/}
    </FormProvider>
  );
};
