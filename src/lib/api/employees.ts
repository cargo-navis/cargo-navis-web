import { backend } from '@/lib/services/backendService';

import type { CreateEmployeeParams, Employee, UpdateEmployeeParams } from './employees.d';

export async function getEmployees() {
  return backend.get<Employee[]>('/api/employees');
}

export async function getEmployee(id: string) {
  // Get single employee
}

export async function createEmployee(data: CreateEmployeeParams) {
  return backend.post<Employee>('/api/employees', data);
}

export async function updateEmployee(id: string, data: UpdateEmployeeParams) {
  return backend.patch<Employee>(`/api/employees/${id}`, data);
}

export async function deleteEmployee(id: string) {
  return backend.delete(`/api/employees/${id}`);
}
