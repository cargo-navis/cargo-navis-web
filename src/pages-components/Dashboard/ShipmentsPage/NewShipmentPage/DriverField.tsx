import { FormCheckbox, FormSingleSelect } from '@/lib/components/form';
import { useDrivers } from '@/lib/hooks';
import { mapEmployeesToOptions } from '@/lib/utils/employees';
import { Box, FlexLayout } from '@/ui';

import { useAgencyFieldReset } from './hooks';

export const DriverField = () => {
  const { data: drivers = [] } = useDrivers();
  const driverOptions = mapEmployeesToOptions(drivers);

  const isAgencyUse = useAgencyFieldReset('driverId');

  // Hide the component completely when isAgencyUse is true
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
        options={driverOptions}
        placeholder="Odaberi vozača..."
      />
      <Box className="-mt-2">
        <FormCheckbox label="Automatski poslati nalog vozaču" name="sentToDriver" />
      </Box>
    </FlexLayout>
  );
};
