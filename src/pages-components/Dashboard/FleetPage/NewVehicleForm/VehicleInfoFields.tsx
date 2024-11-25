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
          <FormTextInput name="enginePower" label="Snaga motora (kW)" type="number" min="0" />
        </Box>
        <Box className="flex-1">
          <FormSingleSelect
            label="Tip motora"
            name="emissionStandard"
            isSearchable
            isClearable
            options={emissionStandardOptions}
            placeholder="Select engine type..."
          />
        </Box>
      </FlexLayout>
      <Box as="hr" className="border-[0px] my-2 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
      <Box>
        <FormTextInput name="tankSize" label="Veličina tanka (l)" type="number" min="0" />
      </Box>
      <Box>
        <FormTextInput name="averageFuelConsumption" label="Potrošnja (l/100km)" type="number" min="0" />
      </Box>
      <Box>
        <FormDatepicker name="fireExtinguisherCheckExpiryDate" label="Vatrogasni aparat - Vrijedi do" />
      </Box>
      <Box>
        <FormDatepicker name="adrExpiryDate" label="ADR - Vrijedi do" />
      </Box>
    </FlexLayout>
  );
};
