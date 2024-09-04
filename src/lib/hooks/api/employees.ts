import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Employee, UpdateEmployeeParams } from '@/lib/api/employees.d';
import { createEmployee, deleteEmployee, getEmployees, updateEmployee } from '@/lib/api';

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

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['employees'], type: 'all' });
    }
  });
}

export function useUpdateEmployee(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateEmployeeParams) => updateEmployee(id, data),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['employees'], type: 'all' });
    }
  });
}

export function useDeleteEmployee(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteEmployee(id),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['employees'], type: 'all' });
    }
  });
}
