import 'dayjs/locale/hr';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';
import { FormProvider, useForm } from 'react-hook-form';
import { DriverInfoFields } from './DriverInfoFields';

import type { Employee } from '@/lib/api/employees.d';
import '@mantine/dates/styles.css';
import { FormRadioGroup, FormTextInput } from '@/lib/components/form';
import { Box, Button } from '@/ui';

import { useCreateEmployee, useUpdateEmployee } from '@/lib/hooks';
import { formDefaultValues, genderOptions, positionOptions } from './const';
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
      const emailTakenException = 'com.scalesoft.cargonavis.domain.EmailAlreadyExistException';
      const errorMessage = error?.response?.data?.error;

      if (errorMessage === emailTakenException) {
        alert(`Korisnik s email adresom "${values.email}" već postoji`);
      } else {
        alert(`Error with form submit. ${error?.message}`);
      }
    }
  }

  return (
    <FormProvider {...formMethods}>
      <Box as="form" className="flex gap-[40px]" onSubmit={handleSubmit(handleFormSubmit)}>
        <Box className="flex flex-col gap-4 w-[480px]">
          <Box className="flex gap-4">
            <Box className="flex-1">
              <FormTextInput name="firstName" label="First Name *" />
            </Box>
            <Box className="flex-1">
              <FormTextInput name="lastName" label="Last Name *" />
            </Box>
          </Box>
          <Box>
            <FormRadioGroup name="gender" label="Gender" options={genderOptions} />
          </Box>
          <Box>
            <FormTextInput name="phoneNumber" label="Phone Number *" type="tel" />
          </Box>
          <Box>
            <FormTextInput
              name="email"
              label="Email *"
              type="email"
              iconLeft={isEdit ? 'LockClosedIcon' : undefined}
              isDisabled={isEdit}
            />
          </Box>
          <FormRadioGroup name="position" label="Position *" options={positionOptions} />
          <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          <Button
            text={isEdit ? 'Update Employee' : 'Create Employee'}
            isFullWidth
            isDisabled={!(isValid && isDirty)}
            isLoading={formState.isSubmitting}
          />
        </Box>
        {values?.position === 'driver' && <DriverInfoFields />}
      </Box>
    </FormProvider>
  );
};
