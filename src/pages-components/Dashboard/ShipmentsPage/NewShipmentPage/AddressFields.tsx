import { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';

import { PostalCodeSelectField } from '@/components/postalCodes/PostalCodeSelectField';
import { FormDatepicker, FormSingleSelect, FormTextarea, FormTextInput } from '@/lib/components/form';
import { countryEuropeOptions } from '@/pages-components/Dashboard/NewEmployeePage/const';
import { FlexLayout, Text, VerticalDivider } from '@/ui';

export const AddressFields = () => {
  const { watch, setValue } = useFormContext();
  const loadingCountryCode = watch('loadingAddress.countryCode');
  const unloadingCountryCode = watch('unloadingAddress.countryCode');

  const isInitialMountLoading = useRef(true);
  const isInitialMountUnloading = useRef(true);

  useEffect(() => {
    if (isInitialMountLoading.current) {
      isInitialMountLoading.current = false;
      return;
    }
    setValue('loadingAddress.postalCodeId', null, { shouldDirty: true });
  }, [loadingCountryCode, setValue]);

  useEffect(() => {
    if (isInitialMountUnloading.current) {
      isInitialMountUnloading.current = false;
      return;
    }
    setValue('unloadingAddress.postalCodeId', null, { shouldDirty: true });
  }, [unloadingCountryCode, setValue]);

  return (
    <FlexLayout as="fieldset" className="flex-col gap-8">
      <FlexLayout className="gap-5">
        <FlexLayout className="flex-1 flex-col gap-4">
          <Text color="text-color-3" variant="text-s-medium">
            Detalji utovara
          </Text>
          <FormTextInput label="Tvrtka utovara" name="loadingCompanyName" rules={{ required: true }} />
          <FormTextInput label="Ulica i broj" name="loadingAddress.name" rules={{ required: true }} />
          <FormSingleSelect
            isSearchable
            label="Država"
            name="loadingAddress.countryCode"
            options={countryEuropeOptions}
            rules={{ required: true }}
          />
          <PostalCodeSelectField
            countryCode={loadingCountryCode}
            iconLeft="MagnifyingGlassIcon"
            isClearable
            isDisabled={!loadingCountryCode}
            label="Poštanski broj"
            name="loadingAddress.postalCodeId"
            placeholder="Odaberi poštanski broj"
            rules={{ required: true }}
          />
          <FormDatepicker label="Datum utovara" name="loadingDate" rules={{ required: true }} />
          <FormDatepicker label="Datum spremnosti za utovar" name="loadingReadyDate" />
          <FormTextarea label="Opis utovara" name="loadingDescription" placeholder="Unesite detalje utovara..." />
        </FlexLayout>
        <VerticalDivider />
        <FlexLayout className="flex-1 flex-col gap-4">
          <Text color="text-color-3" variant="text-s-medium">
            Detalji istovara
          </Text>
          <FormTextInput label="Tvrtka istovara" name="unloadingCompanyName" />
          <FormTextInput label="Ulica i broj" name="unloadingAddress.name" />
          <FormSingleSelect
            isSearchable
            label="Država"
            name="unloadingAddress.countryCode"
            options={countryEuropeOptions}
          />
          <PostalCodeSelectField
            countryCode={unloadingCountryCode}
            iconLeft="MagnifyingGlassIcon"
            isClearable
            isDisabled={!unloadingCountryCode}
            label="Poštanski broj"
            name="unloadingAddress.postalCodeId"
            placeholder="Odaberi poštanski broj"
          />
          <FormDatepicker label="Datum istovara" name="unloadingDate" rules={{ required: true }} />
          <FormDatepicker label="Krajnji rok istovara" name="unloadingDueDate" />
          <FormTextarea label="Opis istovara" name="unloadingDescription" placeholder="Unesite detalje istovara..." />
        </FlexLayout>
      </FlexLayout>
    </FlexLayout>
  );
};

export default AddressFields;
