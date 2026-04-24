import { useEmployee } from '@/lib/hooks/api/employees';
import { Text, type TextProps } from '@/ui';

interface EmployeeNameProps extends Omit<TextProps, 'children'> {
  id?: string | null;
}

export const EmployeeName = ({ id, ...textProps }: EmployeeNameProps) => {
  const { data: employee } = useEmployee(id ?? '');

  if (!employee?.fullName) return null;

  return <Text {...textProps}>{employee.fullName}</Text>;
};
