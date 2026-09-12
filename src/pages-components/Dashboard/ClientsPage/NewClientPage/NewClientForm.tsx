import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { PostalCodeSelectField } from '@/components/postalCodes/PostalCodeSelectField';
import type { Client } from '@/lib/api';
import { FormNumberInput, FormSingleSelect, FormTextInput } from '@/lib/components/form';
import { useCreateClient, useUpdateClient } from '@/lib/hooks';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { countryEuropeOptions } from '@/pages-components/Dashboard/NewEmployeePage/const';
import { Button, FlexLayout, LoadingSpinner, Text } from '@/ui';

import { ClientFormData, clientSchema } from './schema';
import { type ClientFormInitialValues, getFormDefaultValues, getInitialFormDefaultValues } from './utils';

interface NewClientFormProps {
  client?: Client;
  /** Prefill for a new client, e.g. the company the VIES lookup returned. Ignored when editing. */
  initialValues?: ClientFormInitialValues;
}

export const NewClientForm: React.FC<NewClientFormProps> = ({ client, initialValues }) => {
  const { replace } = useRouter();
  const isEdit = !!client;

  const { mutateAsync: createClient } = useCreateClient();
  const { mutateAsync: updateClient } = useUpdateClient(client?.id as string);

  const formMethods = useForm<ClientFormData>({
    defaultValues: initialValues && !client ? getInitialFormDefaultValues(initialValues) : getFormDefaultValues(client),
    resolver: yupResolver(clientSchema),
    mode: 'all',
  });

  const { handleSubmit, formState, watch, resetField } = formMethods;
  const { isDirty, isValid, isLoading } = formState;

  async function handleFormSubmit({ name, addressName, taxId, addressPostalCode, termsOfPayment, email }: any) {
    const payload = {
      name,
      addressName,
      taxId,
      termsOfPayment,
      addressPostalCodeId: addressPostalCode.value,
      email: email || undefined,
    };

    payload['termsOfPayment'] = payload['termsOfPayment'] || 0;

    try {
      if (isEdit) {
        await updateClient(payload);
        showSuccessToast({ title: `Klijent "${name}" uspješno ažuriran` });
      } else {
        await createClient(payload);
        showSuccessToast({ title: `Klijent "${name}" uspješno kreiran` });
      }
      await replace('/dashboard/clients');
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
          <FormTextInput label="Porezni broj" name="taxId" rules={{ required: true }} />
          <FormNumberInput label="Valuta plaćanja (u danima)" name="termsOfPayment" />
          <FormTextInput label="Email" name="email" />
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
              iconLeft="IconSearch"
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
