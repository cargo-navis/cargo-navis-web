import { useQuery } from '@tanstack/react-query';
import { Employee } from '@/lib/employees';
import { getEmployees } from '@/lib/api';
import { employees } from '@/lib/mocks/employees';

interface UseEmployeesArgs<T> {
  select?: (data: Employee[]) => T;
  enabled?: boolean;
}

export function useEmployees<TData = Employee[]>(args?: UseEmployeesArgs<TData>) {
  return useQuery<Employee[], unknown, TData>({
    queryKey: ['employees'],
    queryFn: async () => {
      const res = await getEmployees();
      const { data } = await res.json();

      return data;
    },
    ...args
  });
}

export function useEmployee(id: string) {
  return useEmployees({
    enabled: !!id,
    select: (employees) => {
      return employees.find((e) => e.id.toString() === id);
    },
  });
}