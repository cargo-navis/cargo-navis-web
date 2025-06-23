import type { Employee } from '@/lib/api';

export function mapEmployeesToOptions(employees: Employee[]) {
  return employees.map((employee) => ({
    value: employee.id,
    label: `${employee.firstName} ${employee.lastName}`,
  }));
}

export function decorateFullName(employee: Employee) {
  return { ...employee, fullName: `${employee.firstName} ${employee.lastName}` };
}
