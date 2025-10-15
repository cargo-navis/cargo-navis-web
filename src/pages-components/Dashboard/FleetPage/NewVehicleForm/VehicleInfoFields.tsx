import { FormDatepicker, FormNumberInput, FormSingleSelect } from '@/lib/components/form';
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
          <FormNumberInput label="Snaga motora (kW)" name="enginePower" />
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
        <FormNumberInput label="Veličina tanka (l)" name="tankSize" />
      </Box>
      <Box>
        <FormNumberInput label="Potrošnja (l/100km)" name="averageFuelConsumption" />
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
