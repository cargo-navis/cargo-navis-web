import { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';

import { PostalCodeSelectField } from '@/components/postalCodes/PostalCodeSelectField';
import { FormDatepicker, FormSingleSelect, FormTextarea, FormTextInput } from '@/lib/components/form';
import { countryEuropeOptions } from '@/pages-components/Dashboard/NewEmployeePage/const';
import { Box, FlexLayout, Text, VerticalDivider } from '@/ui';

interface AddressFieldsProps {
  index: number;
}

export const AddressFields: React.FC<AddressFieldsProps> = ({ index }) => {
  const { watch, setValue } = useFormContext();
  const loadingCountryCode = watch(`cargo.${index}.loadingAddress.countryCode`);
  const unloadingCountryCode = watch(`cargo.${index}.unloadingAddress.countryCode`);

  const isInitialMountLoading = useRef(true);
  const isInitialMountUnloading = useRef(true);

  useEffect(() => {
    if (isInitialMountLoading.current) {
      isInitialMountLoading.current = false;
      return;
    }
    setValue(`cargo.${index}.loadingAddress.postalCodeId`, null, { shouldDirty: true });
  }, [loadingCountryCode, setValue, index]);

  useEffect(() => {
    if (isInitialMountUnloading.current) {
      isInitialMountUnloading.current = false;
      return;
    }
    setValue(`cargo.${index}.unloadingAddress.postalCodeId`, null, { shouldDirty: true });
  }, [unloadingCountryCode, setValue, index]);

  return (
    <FlexLayout as="fieldset" className="flex-col gap-4">
      <FlexLayout className="flex-1 flex-col gap-4">
        <Text color="text-color-2" variant="text-m-bold">
          Detalji utovara
        </Text>
        <FlexLayout className="gap-4 grow">
          <FlexLayout className="flex-col gap-4 flex-1">
            <Box className="flex-1">
              <FormTextInput label="Tvrtka utovara" name={`cargo.${index}.loadingCompanyName`} />
            </Box>
            <Box className="flex-1">
              <FormDatepicker label="Datum utovara" name={`cargo.${index}.loadingDate`} rules={{ required: true }} />
            </Box>
            <Box className="flex-1">
              <FormDatepicker label="Datum spremnosti za utovar" name={`cargo.${index}.loadingReadyDate`} />
            </Box>
          </FlexLayout>
          <VerticalDivider />
          <FlexLayout className="flex-col gap-4 flex-1">
            <Box className="flex-1">
              <FormTextInput
                label="Ulica i broj"
                name={`cargo.${index}.loadingAddress.streetName`}
                rules={{ required: true }}
              />
            </Box>
            <Box className="flex-1">
              <FormSingleSelect
                isSearchable
                label="Država"
                name={`cargo.${index}.loadingAddress.countryCode`}
                options={countryEuropeOptions}
                rules={{ required: true }}
              />
            </Box>
            <Box className="flex-1">
              <PostalCodeSelectField
                countryCode={loadingCountryCode}
                iconLeft="MagnifyingGlassIcon"
                isClearable
                isDisabled={!loadingCountryCode}
                label="Poštanski broj"
                name={`cargo.${index}.loadingAddress.postalCodeId`}
                placeholder="Odaberi poštanski broj"
                rules={{ required: true }}
              />
            </Box>
          </FlexLayout>
        </FlexLayout>
        <FormTextarea
          label="Opis utovara"
          name={`cargo.${index}.loadingDescription`}
          placeholder="Unesite detalje utovara..."
        />
      </FlexLayout>
      <FlexLayout className="flex-1 flex-col gap-4">
        <Text color="text-color-2" variant="text-m-bold">
          Detalji istovara
        </Text>
        <FlexLayout className="gap-4 grow">
          <FlexLayout className="flex-col gap-4 flex-1">
            <Box className="flex-1">
              <FormTextInput label="Tvrtka istovara" name={`cargo.${index}.unloadingCompanyName`} />
            </Box>
            <Box className="flex-1">
              <FormDatepicker label="Datum istovara" name={`cargo.${index}.unloadingDate`} rules={{ required: true }} />
            </Box>
            <Box className="flex-1">
              <FormDatepicker label="Krajnji rok istovara" name={`cargo.${index}.unloadingDueDate`} />
            </Box>
          </FlexLayout>
          <VerticalDivider />
          <FlexLayout className="flex-col gap-4 flex-1">
            <Box className="flex-1">
              <FormTextInput
                label="Ulica i broj"
                name={`cargo.${index}.unloadingAddress.streetName`}
                rules={{ required: true }}
              />
            </Box>
            <Box className="flex-1">
              <FormSingleSelect
                isSearchable
                label="Država"
                name={`cargo.${index}.unloadingAddress.countryCode`}
                options={countryEuropeOptions}
                rules={{ required: true }}
              />
            </Box>
            <Box className="flex-1">
              <PostalCodeSelectField
                countryCode={unloadingCountryCode}
                iconLeft="MagnifyingGlassIcon"
                isClearable
                isDisabled={!unloadingCountryCode}
                label="Poštanski broj"
                name={`cargo.${index}.unloadingAddress.postalCodeId`}
                placeholder="Odaberi poštanski broj"
                rules={{ required: true }}
              />
            </Box>
          </FlexLayout>
        </FlexLayout>

        <FormTextarea
          label="Opis istovara"
          name={`cargo.${index}.unloadingDescription`}
          placeholder="Unesite detalje istovara..."
        />
      </FlexLayout>
    </FlexLayout>
  );
};
