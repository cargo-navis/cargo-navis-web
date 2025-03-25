import type React from 'react';

import { VehicleEnum, VehicleLoadEnum } from '@/lib/api';
import {
  FormCheckboxGroup,
  FormDatepicker,
  FormRadioGroup,
  FormSingleSelect,
  FormTextInput,
} from '@/lib/components/form';
import { Box, FlexLayout, Text } from '@/ui';

import { equipmentOptions, loadTypeOptions, rampOptions } from './const';

export const LoadingSpaceFields: React.FC<{ type: VehicleEnum }> = ({ type }) => {
  let loadOptions = loadTypeOptions;

  if (type === VehicleEnum.TRAILER) {
    loadOptions = loadOptions.filter((o) => o.value !== VehicleLoadEnum.TAUTLINER);
  } else if (type === VehicleEnum.SOLO_TRUCK) {
    loadOptions = loadOptions.filter(
      (o) => ![VehicleLoadEnum.CISTERN, VehicleLoadEnum.CONTAINER_TRAILER].includes(o.value as VehicleLoadEnum)
    );
  }

  return (
    <FlexLayout as="fieldset" className="flex-col gap-4 w-[480px]">
      <Text color="text-color-2" variant="text-m-medium">
        Podaci o utovarnom prostoru
      </Text>
      <Box>
        <FormTextInput label="Kapacitet (kg)" min="0" name="loadCapacity" type="number" />
      </Box>
      <Box as="hr" className="border-[0px] my-2 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
      <Box>
        <Text color="text-color-3" variant="text-xs-medium">
          Dimenzije
        </Text>
      </Box>
      <Box>
        <FormTextInput label="Duljina (m)" min="0" name="length" step="0.01" type="number" />
      </Box>
      <Box>
        <FormTextInput label="Širina (m)" min="0" name="width" step="0.01" type="number" />
      </Box>
      <Box>
        <FormTextInput label="Visina (m)" min="0" name="height" step="0.01" type="number" />
      </Box>
      <Box as="hr" className="border-[0px] my-2 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
      <Box>
        <FormDatepicker label="Kod XL Certifikat - Vrijedi do" name="codeXlCertificateExpiryDate" />
      </Box>
      <Box as="hr" className="border-[0px] my-2 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
      <Box className="flex-1">
        <FormRadioGroup label="Rampa" name="ramp" options={rampOptions} />
      </Box>
      <Box className="flex-1">
        <FormSingleSelect
          isClearable
          isSearchable
          label="Vrsta utovarnog prostora"
          name="vehicleLoadType"
          options={loadOptions}
          placeholder="Select load type..."
        />
      </Box>
      <Box as="hr" className="border-[0px] my-2 border-b-[1px] border-light-200 dark:border-white-alpha-25" />
      <Box>
        <FormCheckboxGroup label="Oprema" name="equipment" options={equipmentOptions} />
      </Box>
    </FlexLayout>
  );
};
