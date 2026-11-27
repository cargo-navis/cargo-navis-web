import type { Employee } from '@/lib/api';

export function decorateFullName(employee: Employee) {
  return { ...employee, fullName: `${employee.firstName} ${employee.lastName}` };
}
