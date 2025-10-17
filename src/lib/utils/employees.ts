import type { Employee } from '@/lib/api';

export function mapEmployeesToOptions(employees: Employee[]) {
  const sortedEmployees = employees.sort((a, b) => a.fullName.localeCompare(b.fullName));

  return sortedEmployees.map((employee) => ({
    value: employee.id,
    label: employee.fullName,
  }));
}

export function decorateFullName(employee: Employee) {
  return { ...employee, fullName: `${employee.firstName} ${employee.lastName}` };
}
