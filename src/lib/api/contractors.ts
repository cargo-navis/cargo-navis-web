import { backend } from '@/lib/services/backendService';

import type { Contractor, CreateContractorParams, UpdateContractorParams } from './contractors.d';

export async function getContractors() {
  const contractors = await backend.get<Contractor[]>('/api/transport-contractors');
  return contractors.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createContractor(data: CreateContractorParams) {
  return backend.post<Contractor>('/api/transport-contractors', data);
}

export async function updateContractor(id: string, data: UpdateContractorParams) {
  return backend.put<Contractor>(`/api/transport-contractors/${id}`, data);
}

export async function deleteContractor(id: string) {
  return backend.delete(`/api/transport-contractors/${id}`);
}
