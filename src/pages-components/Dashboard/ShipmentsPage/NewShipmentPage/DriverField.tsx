import { FormSingleSelect } from '@/lib/components/form';
import { useDrivers } from '@/lib/hooks';
import { mapEmployeesToOptions } from '@/lib/utils/employees';

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
    <FormSingleSelect
      isClearable
      isSearchable
      label="Vozač"
      name="driverId"
      options={driverOptions}
      placeholder="Odaberi vozača..."
    />
  );
};
