import { FormDatepicker, FormSingleSelect, FormTextInput } from '@/lib/components/form';
import { Box, FlexLayout, Text } from '@/ui';

import { emissionStandardOptions } from './const';

export const VehicleInfoFields = () => {
  return (
    <FlexLayout as="fieldset" className="flex-col gap-4 w-[480px]">
      <Text color="text-color-2" variant="text-m-medium">
        Podaci o vozilu
      </Text>
      <FlexLayout className="gap-4">
        <Box>
          <FormTextInput label="Snaga motora (kW)" min="0" name="enginePower" type="number" />
        </Box>
        <Box className="flex-1">
          <FormSingleSelect
            isClearable
            isSearchable
            label="Tip motora"
            name="emissionStandard"
            options={emissionStandardOptions}
            placeholder="Select engine type..."
          />
        </Box>
      </FlexLayout>
      <Box as="hr" className="border-[0px] my-2 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
      <Box>
        <FormTextInput label="Veličina tanka (l)" min="0" name="tankSize" type="number" />
      </Box>
      <Box>
        <FormTextInput label="Potrošnja (l/100km)" min="0" name="averageFuelConsumption" type="number" />
      </Box>
      <Box>
        <FormDatepicker label="Vatrogasni aparat - Vrijedi do" name="fireExtinguisherCheckExpiryDate" />
      </Box>
      <Box>
        <FormDatepicker label="ADR - Vrijedi do" name="adrExpiryDate" />
      </Box>
    </FlexLayout>
  );
};
