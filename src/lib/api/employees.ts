import { backend } from '@/lib/services/backendService';

import type { CreateEmployeeParams, Employee, UpdateEmployeeParams } from './employees.d';

export async function getEmployees() {
  return backend.get<Employee[]>('/api/employees');
}

export async function getEmployee(id: string) {
  // Get single employee
  console.log(`GET EMPLOYEE ${id}`);
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

export async function resendEmployeeInvite(id: string) {
  return backend.post<void>(`/api/employees/${id}/resend-invite`);
}

export async function uploadEmployeeFile(id: string, file: File, fileName: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', fileName);
  return backend.post<Employee>(`/api/employees/${id}/files`, formData);
}

export async function getEmployeeDocumentUrl(
  id: string,
  documentId: string,
  disposition: 'inline' | 'attachment' = 'attachment'
) {
  return backend.get<string>(`/api/employees/${id}/files/${documentId}`, { params: { disposition } });
}

export async function deleteEmployeeFile(id: string, documentId: string) {
  return backend.delete<void>(`/api/employees/${id}/files/${documentId}`);
}
