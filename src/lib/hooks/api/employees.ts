import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createEmployee, deleteEmployee, getEmployees, PositionEnum, updateEmployee } from '@/lib/api';
import type { Employee, UpdateEmployeeParams } from '@/lib/api/employees.d';
import { decorateFullName } from '@/lib/utils/employees';

interface UseEmployeesArgs<T> {
  select?: (data: Employee[]) => T;
  enabled?: boolean;
}

const positionHierarchy = {
  [PositionEnum.Ceo]: 1,
  [PositionEnum.Manager]: 2,
  [PositionEnum.Dispatcher]: 3,
  [PositionEnum.Driver]: 4,
};

function sortEmployees(employees: Employee[]) {
  return employees.sort((a, b) => {
    const aOrder = positionHierarchy[a.position] || 999;
    const bOrder = positionHierarchy[b.position] || 999;
    return aOrder - bOrder;
  });
}

export function useEmployees<TData = Employee[]>(args?: UseEmployeesArgs<TData>) {
  return useQuery<Employee[], unknown, TData>({
    queryKey: ['employees'],
    queryFn: async () => {
      const employees = await getEmployees();
      return employees.map(decorateFullName);
    },
    ...args,
    select: args?.select || (sortEmployees as any),
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

export function useDrivers<TData = Employee[]>(args?: UseEmployeesArgs<TData>) {
  return useEmployees<TData>({
    ...args,
    select: (employees) => {
      const drivers = employees.filter((employee) => employee.position === PositionEnum.Driver);
      return args?.select ? args.select(drivers) : (drivers as unknown as TData);
    },
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['employees'], type: 'all' });
    },
  });
}

export function useUpdateEmployee(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateEmployeeParams) => updateEmployee(id, data),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['employees'], type: 'all' });
    },
  });
}

export function useDeleteEmployee(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteEmployee(id),
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ['employees'], type: 'all' });
    },
  });
}
