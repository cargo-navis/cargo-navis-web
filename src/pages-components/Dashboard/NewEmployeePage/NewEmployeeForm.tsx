import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';
import { FormProvider, useForm } from 'react-hook-form';

import { type Employee, MessageChannelEnum } from '@/lib/api/employees.d';
import { FormDatepicker, FormRadioGroup, FormSwitch, FormTextInput } from '@/lib/components/form';
import { useCreateEmployee, useUpdateEmployee } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Box, Button, FlexLayout } from '@/ui';

import { formDefaultValues, genderOptions, positionOptions } from './const';
import { DriverInfoFields } from './DriverInfoFields';
import { employeeSchema } from './schema';
import { extractDirtyFields, processFormData } from './utils';

export const NewEmployeeForm: React.FC<{ employee?: Employee }> = ({ employee }) => {
  const { back } = useRouter();
  const isEdit = !!employee;

  const { mutateAsync: createEmployee } = useCreateEmployee();
  const { mutateAsync: updateEmployee } = useUpdateEmployee(employee?.id as string);

  const defaultValues = employee
    ? { ...employee, isMessageChannelEnabled: employee.messageChannel === MessageChannelEnum.WHATSAPP }
    : formDefaultValues;

  const formMethods = useForm<any>({
    defaultValues,
    resolver: yupResolver(employeeSchema),
    mode: 'all',
  });

  const { watch, handleSubmit, formState } = formMethods;
  const { isDirty, isValid } = formState;
  const values = watch();

  async function handleFormSubmit(data: any) {
    const dirtyFields = extractDirtyFields(data, formState);
    const processedData = processFormData(dirtyFields);

    try {
      if (isEdit) {
        await updateEmployee(processedData);
        showSuccessToast({ title: 'Zaposlenik uspješno ažuriran' });
        void back();
      } else {
        await createEmployee(processedData);
        showSuccessToast({ title: 'Zaposlenik uspješno kreiran' });
        void back();
      }
    } catch (error: any) {
      const emailTakenException = 'com.scalesoft.cargonavis.domain.EmailAlreadyExistException';
      const errorMessage = error?.response?.data?.error;

      if (errorMessage === emailTakenException) {
        showErrorToast({ title: `Korisnik s email adresom "${values.email}" već postoji` });
      } else if (errorMessage === 'Account with the same email or phone number already exists') {
        showErrorToast({ title: `Korisnik s ovom email adresom ili telefonom već postoji` });
      } else {
        showErrorToast({ title: `Greška s unosom zaposlenika. Pokušajte ponovno.` });
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
          <FlexLayout className="gap-4">
            <Box className="flex-grow">
              <FormTextInput label="Telefon *" name="phoneNumber" type="tel" />
            </Box>
            <FormSwitch isDisabled={!values.phoneNumber} label="WhatsApp" name="isMessageChannelEnabled" />
          </FlexLayout>
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
