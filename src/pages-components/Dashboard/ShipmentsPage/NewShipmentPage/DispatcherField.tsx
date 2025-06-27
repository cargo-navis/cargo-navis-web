import { type Employee, PositionEnum } from '@/lib/api';
import { FormSingleSelect } from '@/lib/components/form';
import { useEmployees } from '@/lib/hooks';
import { mapEmployeesToOptions } from '@/lib/utils/employees';

export const DispatcherField = () => {
  const { data: employees = [] } = useEmployees({
    select: (employees: Employee[]) =>
      employees.filter((employee) =>
        [PositionEnum.Dispatcher, PositionEnum.Ceo, PositionEnum.Manager].includes(employee.position)
      ),
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
