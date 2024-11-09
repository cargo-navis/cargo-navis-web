import { FormDatepicker, FormSingleSelect, FormTextInput } from '@/lib/components/form';
import { Box, FlexLayout, Text } from '@/ui';
import { emissionStandardOptions } from './const';

export const VehicleInfoFields = () => {
  return (
    <FlexLayout as="fieldset" className="flex-col gap-4 w-[480px]">
      <Text color="text-color-2" variant="text-m-medium">
        Vehicle Info
      </Text>
      <FlexLayout className="gap-4">
        <Box>
          <FormTextInput name="enginePower" label="Engine Power (kW)" type="number" min="0" />
        </Box>
        <Box className="flex-1">
          <FormSingleSelect
            label="Engine Type"
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
        <FormTextInput name="tankSize" label="Tank Size (Liters)" type="number" min="0" />
      </Box>
      <Box>
        <FormTextInput name="averageFuelConsumption" label="Fuel Consumption (l/100km)" type="number" min="0" />
      </Box>
      <Box>
        <FormDatepicker name="fireExtinguisherCheckExpiryDate" label="Fire Extinguisher - Expiry date" />
      </Box>
      <Box>
        <FormDatepicker name="adrExpiryDate" label="ADR - Expiry date" />
      </Box>
    </FlexLayout>
  );
};
