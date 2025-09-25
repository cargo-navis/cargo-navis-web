import { type Employee, PositionEnum } from '@/lib/api';
import { FormSingleSelect } from '@/lib/components/form';
import { useCurrentTenant, useEmployees } from '@/lib/hooks';
import { mapEmployeesToOptions } from '@/lib/utils/employees';

export const DispatcherField = () => {
  const { data: tenant } = useCurrentTenant();

  const { data: employees = [] } = useEmployees({
    select: (employees: Employee[]) =>
      employees.filter((employee) => {
        // TODO - Temporary override for PER COM d.o.o.
        if (tenant?.name === 'PER COM d.o.o.') {
          return true;
        }

        return [PositionEnum.Dispatcher, PositionEnum.Ceo, PositionEnum.Manager].includes(employee.position);
      }),
  });
  const dispatcherOptions = mapEmployeesToOptions(employees);

  return (
    <FormSingleSelect
      isClearable
      isSearchable
      label="Disponent"
      name="dispatcherId"
      options={dispatcherOptions}
      placeholder="Odaberi disponenta..."
      rules={{ required: true }}
    />
  );
};
