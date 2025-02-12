import { PostalCodeSelectField } from '@/components/postalCodes/PostalCodeSelectField';
import type { Client } from '@/lib/api';
import { FormSingleSelect, FormTextInput } from '@/lib/components/form';
import { useCreateClient } from '@/lib/hooks';
import { countryOptions } from '@/pages-components/Dashboard/NewEmployeePage/const';
import { Box, Button, FlexLayout, Text } from '@/ui';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { formDefaultValues } from './const';

export const NewClientForm: React.FC<{ client?: Client }> = ({ client }) => {
  const { push } = useRouter();
  const isEdit = !!client;

  const { mutateAsync: createClient } = useCreateClient();
  // const { mutateAsync: updateEmployee } = useUpdateEmployee(employee?.id as string);

  const defaultValues = client ? { ...client } : formDefaultValues;

  const formMethods = useForm<any>({
    defaultValues,
    // resolver: yupResolver(employeeSchema),
    mode: 'all',
  });
  //
  const { handleSubmit, formState, watch, resetField } = formMethods;
  const { isDirty, isValid } = formState;

  async function handleFormSubmit({ addressPostalCode, ...rest }: any) {
    const payload = { ...rest, addressPostalCodeId: addressPostalCode.value };

    try {
      await createClient(payload);
      await push('/dashboard/clients');
    } catch (error: any) {
      alert('Dogodila se greška s unosom klijenta. Pokušajte ponovno.');
    }
  }

  const countryCode = watch('countryCode');

  useEffect(() => {
    resetField('addressPostalCode');
  }, [countryCode]);

  return (
    <FormProvider {...formMethods}>
      <FlexLayout as="form" className="gap-[40px]" onSubmit={handleSubmit(handleFormSubmit)}>
        <FlexLayout className="flex-col gap-4 w-[480px]">
          <FormTextInput name="name" label="Ime *" />
          <FlexLayout className="gap-2">
            <Box className="flex-1">
              <FormTextInput name="vatNumber" label="VAT *" />
            </Box>
            <Box className="flex-1">
              <FormTextInput name="nationalCompanyRegisterId" label="OIB *" />
            </Box>
          </FlexLayout>
          <FlexLayout className="flex-1 flex-col gap-2">
            <Text color="text-color-3" variant="text-xxs-medium">
              Adresa sjedišta
            </Text>
            <FormTextInput name="addressName" label="Ulica i broj" />
            <FormSingleSelect name="countryCode" label="Država" isSearchable options={countryOptions} />
            <PostalCodeSelectField
              isDisabled={!countryCode}
              name="addressPostalCode"
              label="Poštanski broj"
              iconLeft="MagnifyingGlassIcon"
              placeholder="Odaberi poštanski broj"
              isClearable
              countryCode={countryCode}
            />
          </FlexLayout>
          <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          <Button
            text={isEdit ? 'Ažuriraj Klijenta' : 'Dodaj Klijenta'}
            isFullWidth
            isDisabled={!(isValid && isDirty)}
            isLoading={formState.isSubmitting}
          />
        </FlexLayout>
      </FlexLayout>
    </FormProvider>
  );
};
