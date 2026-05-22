import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createEmployee, deleteEmployee, getEmployees, PositionEnum, updateEmployee } from '@/lib/api';
import type { Employee, UpdateEmployeeParams } from '@/lib/api/employees.d';
import { decorateFullName } from '@/lib/utils/employees';

interface UseEmployeesArgs<T> {
  select?: (data: Employee[]) => T;
  enabled?: boolean;
  includeDeleted?: boolean;
}

const positionHierarchy = {
  [PositionEnum.Ceo]: 1,
  [PositionEnum.Manager]: 2,
  [PositionEnum.Dispatcher]: 3,
  [PositionEnum.Driver]: 4,
};

function sortEmployees(employees: Employee[]) {
  return employees.sort((a, b) => {
    if (a.deleted !== b.deleted) return a.deleted ? 1 : -1;
    const aOrder = positionHierarchy[a.positions[0]] || 999;
    const bOrder = positionHierarchy[b.positions[0]] || 999;
    return aOrder - bOrder;
  });
}

export function useEmployees<TData = Employee[]>(args?: UseEmployeesArgs<TData>) {
  const { includeDeleted, select: userSelect, ...rest } = args ?? {};

  return useQuery<Employee[], unknown, TData>({
    queryKey: ['employees'],
    queryFn: async () => {
      const employees = await getEmployees();
      return employees.map(decorateFullName);
    },
    ...rest,
    select: (employees) => {
      const filtered = includeDeleted ? employees : employees.filter((e) => !e.deleted);
      return userSelect ? userSelect(filtered) : (sortEmployees(filtered) as unknown as TData);
    },
  });
}

export function useEmployee(id: string) {
  return useEmployees({
    enabled: !!id,
    includeDeleted: true,
    select: (employees) => {
      return employees.find((e) => e.id.toString() === id);
    },
  });
}

function sortByFullName(employees: Employee[]) {
  return [...employees].sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export function useDrivers<TData = Employee[]>(args?: UseEmployeesArgs<TData>) {
  return useEmployees<TData>({
    ...args,
    select: (employees) => {
      const drivers = sortByFullName(employees.filter((employee) => employee.positions.includes(PositionEnum.Driver)));
      return args?.select ? args.select(drivers) : (drivers as unknown as TData);
    },
  });
}

export function useDispatchers<TData = Employee[]>(args?: UseEmployeesArgs<TData>) {
  return useEmployees<TData>({
    ...args,
    select: (employees) => {
      const dispatchers = sortByFullName(
        employees.filter((employee) => employee.positions.includes(PositionEnum.Dispatcher))
      );
      return args?.select ? args.select(dispatchers) : (dispatchers as unknown as TData);
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
