import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import { FormCheckbox, FormSingleSelect } from '@/lib/components/form';
import { useDrivers, useFuseSelectFilter } from '@/lib/hooks';
import { mapEmployeesToOptions } from '@/lib/utils/employees';
import { Box, DisplayIf, FlexLayout } from '@/ui';

import { useAgencyFieldReset } from './hooks';

const FUSE_OPTIONS = { keys: ['fullName'] };

export const DriverField = () => {
  const { data: drivers = [] } = useDrivers();
  const { data: filtered, onInputChange } = useFuseSelectFilter(drivers, FUSE_OPTIONS);

  const isAgencyUse = useAgencyFieldReset('driverId');

  const { watch, resetField } = useFormContext();
  const driverId = watch('driverId');

  const selectedDriver = drivers.find((driver) => driver.id === driverId);
  const isCheckboxDisplayed = !!selectedDriver?.messageChannel;

  useEffect(() => {
    resetField('sentToDriver');
  }, [driverId]);

  if (isAgencyUse) {
    return null;
  }

  return (
    <FlexLayout className="flex-col">
      <FormSingleSelect
        isClearable
        isSearchable
        label="Vozač"
        name="driverId"
        options={mapEmployeesToOptions(filtered)}
        placeholder="Odaberi vozača..."
        onInputChange={onInputChange}
      />
      <DisplayIf condition={isCheckboxDisplayed}>
        <Box className="mt-2">
          <FormCheckbox label="Automatski poslati nalog vozaču" name="sentToDriver" />
        </Box>
      </DisplayIf>
    </FlexLayout>
  );
};
