import type { Tenant, UpdateTenantParams } from '@/lib/api/tenant.d';
import { backend } from '@/lib/services/backendService';

export async function getCurrentTenant() {
  return backend.get<Tenant>('/api/tenant');
}

export async function updateTenant(data: UpdateTenantParams) {
  return backend.patch<Tenant>('/api/tenant', data);
}
