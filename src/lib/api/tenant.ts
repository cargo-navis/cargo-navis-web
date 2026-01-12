import type { Tenant, UpdateTenantParams } from '@/lib/api/tenant.d';
import { backend } from '@/lib/services/backendService';

export async function getCurrentTenant() {
  return backend.get<Tenant>('/api/tenant');
}

export async function updateTenant(data: UpdateTenantParams) {
  return backend.put<Tenant>('/api/tenant', data);
}

export async function uploadTenantLogo(file: File, fileName: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', fileName);

  return backend.post<Tenant>(`/api/tenant/logo`, formData);
}

export async function deleteTenantLogo() {
  return backend.delete<void>(`/api/tenant/logo`);
}
