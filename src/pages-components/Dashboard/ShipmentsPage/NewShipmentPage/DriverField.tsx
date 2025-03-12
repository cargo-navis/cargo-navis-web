import { type Employee, PositionEnum } from '@/lib/api';
import { FormSingleSelect } from '@/lib/components/form';
import { useEmployees } from '@/lib/hooks';

function mapEmployeesToOptions(employees: Employee[]) {
  return employees.map((employee) => ({
    value: employee.id,
    label: `${employee.firstName} ${employee.lastName}`,
  }));
}

export const DriverField = () => {
  const { data: employees = [] } = useEmployees({
    select: (employees: Employee[]) => employees.filter((employee) => employee.position === PositionEnum.Driver),
  });
  const driverOptions = mapEmployeesToOptions(employees);

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
