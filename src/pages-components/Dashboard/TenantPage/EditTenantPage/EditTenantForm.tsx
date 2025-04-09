import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/router';
import { FormProvider, useForm } from 'react-hook-form';

import type { Tenant } from '@/lib/api/tenant.d';
import { FormTextInput } from '@/lib/components/form';
import { useUpdateTenant } from '@/lib/hooks/api/tenant';
import { Box, Button, FlexLayout, LoadingSpinner, Text } from '@/ui';

import { getFormDefaultValues, TenantFormData, tenantSchema } from './schema';

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
    termsOfPayment,
    address,
  }: TenantFormData) {
    const payload = {
      name,
      vatNumber,
      nationalCompanyRegisterId,
      communityLicenseId,
      cargoInsuranceExpiryDate,
      termsOfPayment,
      address,
    };

    try {
      await updateTenant(payload);
      void back();
    } catch {
      alert('Dogodila se greška s ažuriranjem podataka tvrtke. Pokušajte ponovno.');
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
          <FormTextInput label="Broj licence" name="communityLicenseId" rules={{ required: true }} />
          <FormTextInput label="Datum isteka osiguranja" name="cargoInsuranceExpiryDate" rules={{ required: true }} />
          <FormTextInput label="Valuta plaćanja" name="termsOfPayment" rules={{ required: true }} />
          <FlexLayout className="flex-1 flex-col gap-2">
            <Text color="text-color-3" variant="text-xxs-medium">
              Adresa sjedišta
            </Text>
            <FormTextInput label="Mjesto" name="address.placeName" rules={{ required: true }} />
            <FormTextInput label="Poštanski broj" name="address.postalCode" rules={{ required: true }} />
          </FlexLayout>
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
