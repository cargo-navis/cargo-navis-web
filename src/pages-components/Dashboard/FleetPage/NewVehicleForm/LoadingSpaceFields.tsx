import { VehicleEnum, VehicleLoadEnum } from '@/lib/api';
import {
  FormCheckboxGroup,
  FormDatepicker,
  FormRadioGroup,
  FormSingleSelect,
  FormTextInput,
} from '@/lib/components/form';
import { Box, FlexLayout, Text } from '@/ui';
import type React from 'react';

import { equipmentOptions, loadTypeOptions, rampOptions } from './const';

export const LoadingSpaceFields: React.FC<{ type: VehicleEnum }> = ({ type }) => {
  let loadOptions = loadTypeOptions;

  if (type === VehicleEnum.TRAILER) {
    loadOptions = loadOptions.filter((o) => o.value !== VehicleLoadEnum.TAUTLINER);
  } else if (type === VehicleEnum.SOLO_TRUCK) {
    loadOptions = loadOptions.filter(
      (o) => ![VehicleLoadEnum.CISTERN, VehicleLoadEnum.CONTAINER_TRAILER].includes(o.value as VehicleLoadEnum),
    );
  }

  return (
    <FlexLayout as="fieldset" className="flex-col gap-4 w-[480px]">
      <Text color="text-color-2" variant="text-m-medium">
        Loading Space Info
      </Text>
      <Box>
        <FormTextInput name="loadCapacity" label="Load Capacity (kg)" type="number" min="0" />
      </Box>
      <Box as="hr" className="border-[0px] my-2 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
      <Box>
        <Text color="text-color-3" variant="text-xs-medium">
          Dimensions
        </Text>
      </Box>
      <Box>
        <FormTextInput name="width" label="Width (m)" type="number" min="0" />
      </Box>
      <Box>
        <FormTextInput name="height" label="Height (m)" type="number" min="0" />
      </Box>
      <Box>
        <FormTextInput name="length" label="Length (m)" type="number" min="0" />
      </Box>
      <Box as="hr" className="border-[0px] my-2 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
      <Box>
        <FormDatepicker name="codeXlCertificateExpiryDate" label="Code XL Certificate - Expiry date" />
      </Box>
      <Box as="hr" className="border-[0px] my-2 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
      <Box className="flex-1">
        <FormRadioGroup name="ramp" label="Ramp" options={rampOptions} />
      </Box>
      <Box className="flex-1">
        <FormSingleSelect
          label="Load Type"
          name="vehicleLoadType"
          isSearchable
          isClearable
          options={loadOptions}
          placeholder="Select load type..."
        />
      </Box>
      <Box as="hr" className="border-[0px] my-2 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
      <Box>
        <FormCheckboxGroup name="equipment" label="Equipment" options={equipmentOptions} />
      </Box>
    </FlexLayout>
  );
};
