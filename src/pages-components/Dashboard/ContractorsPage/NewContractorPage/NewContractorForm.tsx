import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { PostalCodeSelectField } from '@/components/postalCodes/PostalCodeSelectField';
import type { Contractor } from '@/lib/api';
import { FormSingleSelect, FormTextInput } from '@/lib/components/form';
import { useCreateContractor, useUpdateContractor } from '@/lib/hooks';
import { countryEuropeOptions } from '@/pages-components/Dashboard/NewEmployeePage/const';
import { Box, Button, FlexLayout, Text } from '@/ui';

import { getFormDefaultValues } from './utils';

export const NewContractorForm: React.FC<{ contractor?: Contractor }> = ({ contractor }) => {
  const { push } = useRouter();
  const isEdit = !!contractor;

  const { mutateAsync: createContractor } = useCreateContractor();
  const { mutateAsync: updateContractor } = useUpdateContractor(contractor?.id as string);

  const formMethods = useForm<any>({
    defaultValues: getFormDefaultValues(contractor),
    mode: 'all',
  });

  const { handleSubmit, formState, watch, resetField } = formMethods;
  const { isDirty, isValid } = formState;

  async function handleFormSubmit({ name, addressName, vatNumber, nationalCompanyRegisterId, addressPostalCode }: any) {
    const payload = {
      name,
      addressName,
      vatNumber,
      nationalCompanyRegisterId,
      addressPostalCodeId: addressPostalCode.value,
    };

    try {
      if (isEdit) {
        await updateContractor(payload);
        await push(`/dashboard/contractors/${contractor.id}`);
      } else {
        await createContractor(payload);
        await push('/dashboard/contractors');
      }
    } catch {
      alert('Dogodila se greška s unosom kontraktora. Pokušajte ponovno.');
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
            text={isEdit ? 'Ažuriraj Kontraktora' : 'Dodaj Kontraktora'}
          />
        </FlexLayout>
      </FlexLayout>
    </FormProvider>
  );
};
