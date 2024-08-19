import sortBy from 'lodash/sortBy';

import { employees } from '@/lib/mocks/employees';
import { backend } from '@/lib/services/backendService';
import { sleep } from '@/lib/utils/async';

export async function getEmployees() {
  // await sleep();
  return backend.get('/api/employees');
  return sortBy(employees, (e) => e.position);
}

export async function getEmployee(id: string) {
  // await sleep();
  return employees.find(e => e.id === id);
}

export async function createEmployee() {
  await sleep();
  // return backend.post<any>('/api/employees', values);
}

export async function updateEmployee(id: string) {
  // return backend.put<any>(`/api/employees/${id}`, values);
}

export async function deleteEmployee(id: string) {
  return backend.delete(`/api/employees/${id}`);
}