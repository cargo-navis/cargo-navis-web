import { CreateEmployeeParams, UpdateEmployeeParams } from './employees.d';

const rootUrl = process.env.NEXT_PUBLIC_NEXT_URL;

if(!process.env.NEXT_PUBLIC_NEXT_URL) {
  throw new Error('Missing NEXT_PUBLIC_NEXT_URL env var.');
}

export async function getEmployees() {
  // return sortBy(employees, (e) => e.position);
  return fetch(`${rootUrl}/api/employees`);
}

export async function getEmployee(id: string) {
  // Get single employee

  // await sleep();
  // return employees.find(e => e.id === id);
}

export async function createEmployee(data: CreateEmployeeParams) {
  return fetch(`${rootUrl}/api/employees`, { method: 'POST', body: JSON.stringify(data) });
}

export async function updateEmployee(id: string, data: UpdateEmployeeParams) {
  return fetch(`${rootUrl}/api/employees/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export async function deleteEmployee(id: string) {
  return fetch(`${rootUrl}/api/employees/${id}`, { method: 'DELETE' });
}