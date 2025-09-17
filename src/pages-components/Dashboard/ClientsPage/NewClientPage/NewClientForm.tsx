import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { PostalCodeSelectField } from '@/components/postalCodes/PostalCodeSelectField';
import type { Client } from '@/lib/api';
import { FormSingleSelect, FormTextInput } from '@/lib/components/form';
import { useCreateClient, useUpdateClient } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { countryEuropeOptions } from '@/pages-components/Dashboard/NewEmployeePage/const';
import { Box, Button, FlexLayout, LoadingSpinner, Text } from '@/ui';

import { ClientFormData, clientSchema } from './schema';
import { getFormDefaultValues } from './utils';

export const NewClientForm: React.FC<{ client?: Client }> = ({ client }) => {
  const { back } = useRouter();
  const isEdit = !!client;

  const { mutateAsync: createClient } = useCreateClient();
  const { mutateAsync: updateClient } = useUpdateClient(client?.id as string);

  const formMethods = useForm<ClientFormData>({
    defaultValues: getFormDefaultValues(client),
    resolver: yupResolver(clientSchema),
    mode: 'all',
  });

  const { handleSubmit, formState, watch, resetField } = formMethods;
  const { isDirty, isValid, isLoading } = formState;

  async function handleFormSubmit({
    name,
    addressName,
    vatNumber,
    nationalCompanyRegisterId,
    addressPostalCode,
    termsOfPayment,
  }: any) {
    const payload = {
      name,
      addressName,
      vatNumber,
      nationalCompanyRegisterId,
      termsOfPayment,
      addressPostalCodeId: addressPostalCode.value,
    };

    try {
      if (isEdit) {
        await updateClient(payload);
        showSuccessToast({ title: 'Klijent uspješno ažuriran' });
        void back();
      } else {
        await createClient(payload);
        showSuccessToast({ title: 'Klijent uspješno kreiran' });
        void back();
      }
    } catch {
      showErrorToast({ title: 'Dogodila se greška s unosom klijenta. Pokušajte ponovno.' });
    }
  }

  const countryCode = watch('countryCode');

  useEffect(() => {
    resetField('addressPostalCode');
  }, [countryCode]);

  if (isLoading) {
    return <LoadingSpinner size="l" />;
  }

  return (
    <FormProvider {...formMethods}>
      <FlexLayout as="form" className="gap-[40px]" onSubmit={handleSubmit(handleFormSubmit)}>
        <FlexLayout className="flex-col gap-4 w-[640px]">
          <FormTextInput label="Ime" name="name" rules={{ required: true }} />
          <FlexLayout className="gap-2">
            <Box className="flex-1">
              <FormTextInput label="VAT" name="vatNumber" rules={{ required: true }} />
            </Box>
            <Box className="flex-1">
              <FormTextInput label="OIB" name="nationalCompanyRegisterId" rules={{ required: true }} />
            </Box>
          </FlexLayout>
          <FormTextInput
            label="Valuta plaćanja (u danima)"
            min="0"
            name="termsOfPayment"
            rules={{ required: true }}
            type="number"
          />
          <FlexLayout className="flex-1 flex-col gap-2">
            <Text color="text-color-3" variant="text-xxs-medium">
              Adresa sjedišta
            </Text>
            <FormTextInput label="Ulica i broj" name="addressName" rules={{ required: true }} />
            <FormSingleSelect
              isSearchable
              label="Država"
              name="countryCode"
              options={countryEuropeOptions}
              rules={{ required: true }}
            />
            <PostalCodeSelectField
              countryCode={countryCode}
              iconLeft="MagnifyingGlassIcon"
              isClearable
              isDisabled={!countryCode}
              label="Poštanski broj"
              name="addressPostalCode"
              placeholder="Odaberi poštanski broj"
              rules={{ required: true }}
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
