import type { Tenant } from '@/lib/api/tenant.d';
import { backend } from '@/lib/services/backendService';

export async function getCurrentTenant() {
  return backend.get<Tenant>('/api/tenant');
}
