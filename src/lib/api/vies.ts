import { backend } from '../services/backendService';
import type { ViesCompany, ViesLookupParams } from './vies.d';

export function lookupViesCompany(params: ViesLookupParams) {
  return backend.get<ViesCompany>('/api/vies/lookup', { params });
}
