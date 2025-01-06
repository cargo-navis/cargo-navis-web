import { backend } from '@/lib/services/backendService';

export function getCurrentUser() {
  return backend.get<any>('/api/account');
}
