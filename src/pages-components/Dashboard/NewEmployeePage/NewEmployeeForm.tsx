import 'dayjs/locale/hr';
import '@mantine/dates/styles.css';

import { useRouter } from 'next/router';
import { FormProvider, useForm } from 'react-hook-form';

import type { Employee } from '@/lib/api/employees.d';
import { FormDatepicker, FormRadioGroup, FormTextInput } from '@/lib/components/form';
import { useCreateEmployee, useUpdateEmployee } from '@/lib/hooks';
import { replaceEmptyStringsWithNull } from '@/lib/utils/data';
import { Box, Button, FlexLayout } from '@/ui';

import { formDefaultValues, genderOptions, positionOptions } from './const';
import { DriverInfoFields } from './DriverInfoFields';

export const NewEmployeeForm: React.FC<{ employee?: Employee }> = ({ employee }) => {
  const { push } = useRouter();
  const isEdit = !!employee;

  const { mutateAsync: createEmployee } = useCreateEmployee();
  const { mutateAsync: updateEmployee } = useUpdateEmployee(employee?.id as string);

  const defaultValues = employee ? { ...employee } : formDefaultValues;

  const formMethods = useForm<any>({
    defaultValues,
    // resolver: yupResolver(employeeSchema),
    mode: 'all',
  });

  const { watch, handleSubmit, formState } = formMethods;
  const { isDirty, isValid } = formState;
  const values = watch();

  async function handleFormSubmit(data: any) {
    const updatedData = Object.keys(data).reduce(
      (acc, key) => {
        if (formState.dirtyFields[key]) {
          acc[key] = data[key];
        }
        return acc;
      },
      {} as Record<string, any>
    );

    const processedData = replaceEmptyStringsWithNull(updatedData);

    try {
      if (isEdit) {
        await updateEmployee(processedData);
        await push(`/dashboard/employees/${employee.id}`);
      } else {
        await createEmployee(processedData);
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
      <FlexLayout as="form" className="gap-[40px]" onSubmit={handleSubmit(handleFormSubmit)}>
        <FlexLayout className="flex-col gap-4 w-[480px]">
          <FlexLayout className="gap-4">
            <Box className="flex-1">
              <FormTextInput label="Ime *" name="firstName" />
            </Box>
            <Box className="flex-1">
              <FormTextInput label="Prezime *" name="lastName" />
            </Box>
          </FlexLayout>
          <Box>
            <FormRadioGroup label="Spol" name="gender" options={genderOptions} />
          </Box>
          <FlexLayout className="gap-4">
            <Box className="flex-1">
              <FormDatepicker label="Datum rođenja" name="dateOfBirth" />
            </Box>
            <Box className="flex-1">
              <FormTextInput label="Adresa" name="residenceAddress" />
            </Box>
          </FlexLayout>
          <Box>
            <FormTextInput label="Telefon *" name="phoneNumber" type="tel" />
          </Box>
          <Box>
            <FormTextInput label="Email" name="email" type="email" />
          </Box>
          <FormRadioGroup label="Pozicija *" name="position" options={positionOptions} />
          <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          <Button
            isDisabled={!(isValid && isDirty)}
            isFullWidth
            isLoading={formState.isSubmitting}
            text={isEdit ? 'Ažuriraj Zaposlenika' : 'Dodaj Zaposlenika'}
          />
        </FlexLayout>
        {values?.position === 'driver' && <DriverInfoFields />}
      </FlexLayout>
    </FormProvider>
  );
};
