import { useFormContext } from 'react-hook-form';

import { PostalCodeSelectField } from '@/components/postalCodes/PostalCodeSelectField';
import { FormDatepicker, FormSingleSelect, FormTextarea, FormTextInput } from '@/lib/components/form';
import { countryEuropeOptions } from '@/pages-components/Dashboard/NewEmployeePage/const';
import { FlexLayout, Text } from '@/ui';

export const AddressFields = () => {
  const { watch } = useFormContext();
  const loadingCountryCode = watch('loadingAddress.countryCode');
  const unloadingCountryCode = watch('unloadingAddress.countryCode');

  return (
    <FlexLayout as="fieldset" className="flex-col gap-8">
      <FlexLayout className="gap-4">
        <FlexLayout className="flex-1 flex-col gap-4">
          <Text color="text-color-3" variant="text-xxs-medium">
            Detalji utovara
          </Text>
          <FormTextInput name="loadingAddress.name" placeholder="Ulica i broj" />
          <FormSingleSelect
            isSearchable
            label="Država"
            name="loadingAddress.countryCode"
            options={countryEuropeOptions}
          />
          <PostalCodeSelectField
            countryCode={loadingCountryCode}
            iconLeft="MagnifyingGlassIcon"
            isClearable
            isDisabled={!loadingCountryCode}
            label="Poštanski broj"
            name="loadingAddress.postalCodeId"
            placeholder="Odaberi poštanski broj"
          />
          <FormDatepicker label="Datum spremnosti za utovar" name="loadingReadyDate" />
          <FormDatepicker label="Datum utovara" name="loadingDate" />
          <FormTextarea label="Opis utovara" name="loadingDescription" placeholder="Unesite detalje utovara..." />
        </FlexLayout>

        <FlexLayout className="flex-1 flex-col gap-4">
          <Text color="text-color-3" variant="text-xxs-medium">
            Detalji istovara
          </Text>
          <FormTextInput name="unloadingAddress.name" placeholder="Ulica i broj" />
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
          <FormDatepicker label="Datum istovara" name="unloadingDate" />
          <FormDatepicker label="Krajnji rok istovara" name="unloadingDueDate" />
          <FormTextarea label="Opis istovara" name="unloadingDescription" placeholder="Unesite detalje istovara..." />
        </FlexLayout>
      </FlexLayout>
    </FlexLayout>
  );
};

export default AddressFields;
