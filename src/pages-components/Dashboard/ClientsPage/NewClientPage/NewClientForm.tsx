import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { PostalCodeSelectField } from '@/components/postalCodes/PostalCodeSelectField';
import type { Client } from '@/lib/api';
import { FormSingleSelect, FormTextInput } from '@/lib/components/form';
import { useCreateClient, useUpdateClient } from '@/lib/hooks';
import { countryEuropeOptions } from '@/pages-components/Dashboard/NewEmployeePage/const';
import { Box, Button, FlexLayout, Text } from '@/ui';

import { formDefaultValues } from './const';

export const NewClientForm: React.FC<{ client?: Client }> = ({ client }) => {
  const { push } = useRouter();
  const isEdit = !!client;

  const { mutateAsync: createClient } = useCreateClient();
  const { mutateAsync: updateClient } = useUpdateClient(client?.id as string);

  const defaultValues = client
    ? {
        ...client,
        addressName: client.address?.streetName,
        countryCode: client.address?.countryCode,
        addressPostalCode: {
          value: client.address.postalCode,
          label: client.address.postalCode,
        },
      }
    : formDefaultValues;

  const formMethods = useForm<any>({
    defaultValues,
    // resolver: yupResolver(clientsSchema),
    mode: 'all',
  });
  //
  const { handleSubmit, formState, watch, resetField } = formMethods;
  const { isDirty, isValid } = formState;

  async function handleFormSubmit({ name, addressName, vatNumber, nationalCompanyRegisterId, addressPostalCode }: any) {
    const payload = {
      name,
      addressName,
      vatNumber,
      nationalCompanyRegisterId,
      addressPostalCodeId: addressPostalCode.value, // TODO - fix editing of Client
    };

    try {
      if (isEdit) {
        await updateClient(payload);
        await push(`/dashboard/clients/${client.id}`);
      } else {
        await createClient(payload);
        await push('/dashboard/clients');
      }
    } catch {
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
        <FlexLayout className="flex-col gap-4 w-[640px]">
          <FormTextInput label="Ime *" name="name" />
          <FlexLayout className="gap-2">
            <Box className="flex-1">
              <FormTextInput label="VAT *" name="vatNumber" />
            </Box>
            <Box className="flex-1">
              <FormTextInput label="OIB *" name="nationalCompanyRegisterId" />
            </Box>
          </FlexLayout>
          <FlexLayout className="flex-1 flex-col gap-2">
            <Text color="text-color-3" variant="text-xxs-medium">
              Adresa sjedišta
            </Text>
            <FormTextInput label="Ulica i broj" name="addressName" />
            <FormSingleSelect isSearchable label="Država" name="countryCode" options={countryEuropeOptions} />
            <PostalCodeSelectField
              countryCode={countryCode}
              iconLeft="MagnifyingGlassIcon"
              isClearable
              isDisabled={!countryCode}
              label="Poštanski broj"
              name="addressPostalCode"
              placeholder="Odaberi poštanski broj"
            />
          </FlexLayout>
          <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          <Button
            isDisabled={!(isValid && isDirty)}
            isFullWidth
            isLoading={formState.isSubmitting}
            text={isEdit ? 'Ažuriraj Klijenta' : 'Dodaj Klijenta'}
          />
        </FlexLayout>
      </FlexLayout>
    </FormProvider>
  );
};
