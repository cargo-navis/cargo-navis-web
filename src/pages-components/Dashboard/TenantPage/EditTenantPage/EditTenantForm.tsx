import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';

import { PostalCodeSelectField } from '@/components/postalCodes/PostalCodeSelectField';
import type { Tenant } from '@/lib/api/tenant.d';
import { FormDatepicker, FormSingleSelect, FormTextInput } from '@/lib/components/form';
import { useUpdateTenant } from '@/lib/hooks/api/tenant';
import { showErrorToast, showSuccessToast } from '@/lib/utils/toast';
import { Box, Button, FlexLayout, LoadingSpinner, Text } from '@/ui';

import { countryEuropeOptions } from '../../NewEmployeePage/const';
import { tenantSchema } from './schema';
import { getFormDefaultValues, TenantFormData } from './utils';

export const EditTenantForm: React.FC<{ tenant: Tenant }> = ({ tenant }) => {
  const { back } = useRouter();
  const { mutateAsync: updateTenant } = useUpdateTenant();

  const formMethods = useForm<TenantFormData>({
    defaultValues: getFormDefaultValues(tenant),
    resolver: yupResolver(tenantSchema),
    mode: 'all',
  });

  const { handleSubmit, formState } = formMethods;
  const { isDirty, isValid, isLoading } = formState;

  async function handleFormSubmit({
    name,
    vatNumber,
    nationalCompanyRegisterId,
    communityLicenseId,
    cargoInsuranceExpiryDate,
    address,
  }: TenantFormData) {
    const payload = {
      name,
      vatNumber,
      nationalCompanyRegisterId,
      communityLicenseId,
      cargoInsuranceExpiryDate,
      address: {
        streetName: address.streetName,
        postalCodeId: address.postalCode.value,
      },
    };

    try {
      await updateTenant(payload);
      showSuccessToast({ title: 'Podaci tvrtke uspješno ažurirani' });
      void back();
    } catch {
      showErrorToast({ title: 'Dogodila se greška s ažuriranjem podataka tvrtke. Pokušajte ponovno.' });
    }
  }

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
          <FormTextInput label="Broj licence" name="communityLicenseId" />
          <FormDatepicker label="Datum isteka osiguranja" name="cargoInsuranceExpiryDate" />
          <AddressFields />
          <hr className="border-[0px] my-4 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
          <Button
            isDisabled={!(isValid && isDirty)}
            isFullWidth
            isLoading={formState.isSubmitting}
            text="Ažuriraj Podatke Tvrtke"
          />
        </FlexLayout>
      </FlexLayout>
    </FormProvider>
  );
};

const AddressFields = () => {
  const { watch } = useFormContext();
  const countryCode = watch('address.countryCode');

  return (
    <FlexLayout className="flex-1 flex-col gap-2">
      <Text color="text-color-3" variant="text-xxs-medium">
        Adresa sjedišta
      </Text>
      <FormTextInput label="Ulica" name="address.streetName" rules={{ required: true }} />
      <FormSingleSelect
        isSearchable
        label="Država"
        name="address.countryCode"
        options={countryEuropeOptions}
        rules={{ required: true }}
      />
      <PostalCodeSelectField
        countryCode={countryCode}
        iconLeft="MagnifyingGlassIcon"
        isClearable
        isDisabled={!countryCode}
        label="Poštanski broj"
        name="address.postalCode"
        placeholder="Odaberi poštanski broj"
        rules={{ required: true }}
      />
    </FlexLayout>
  );
};
