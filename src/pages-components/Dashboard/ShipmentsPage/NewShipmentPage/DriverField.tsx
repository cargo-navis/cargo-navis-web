import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

import { PositionEnum } from '@/lib/api';
import { FormCheckbox, FormSingleSelect } from '@/lib/components/form';
import { useCurrentTenant, useEmployees } from '@/lib/hooks';
import { mapEmployeesToOptions } from '@/lib/utils/employees';
import { Box, DisplayIf, FlexLayout } from '@/ui';

import { useAgencyFieldReset } from './hooks';

export const DriverField = () => {
  const { data: tenant } = useCurrentTenant();

  // TODO - Temporary override for PER COM d.o.o. and Animago d.o.o.
  const { data: drivers = [] } = useEmployees({
    select: (employees) => {
      if (tenant?.name === 'PER COM d.o.o.') {
        return employees;
      }

      const drivers = employees.filter(({ position }) => position === PositionEnum.Driver);

      if (tenant?.name === 'Animago d.o.o.') {
        const extraDriversNames = ['Goran Pranjić', 'Milorad Pranjić'];
        const extraDrivers = employees.filter((employee) => extraDriversNames.includes(employee.fullName));
        return [...extraDrivers, ...drivers];
      }

      return drivers;
    },
  });
  const driverOptions = mapEmployeesToOptions(drivers);

  const isAgencyUse = useAgencyFieldReset('driverId');

  const { watch, resetField } = useFormContext();
  const driverId = watch('driverId');

  const selectedDriver = drivers.find((driver) => driver.id === driverId);
  const isCheckboxDisplayed = !!selectedDriver?.messageChannel;

  useEffect(() => {
    resetField('sentToDriver');
  }, [driverId]);

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
      <DisplayIf condition={isCheckboxDisplayed}>
        <Box className="-mt-2">
          <FormCheckbox label="Automatski poslati nalog vozaču" name="sentToDriver" />
        </Box>
      </DisplayIf>
    </FlexLayout>
  );
};
