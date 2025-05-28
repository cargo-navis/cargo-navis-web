import { backend } from '@/lib/services/backendService';

import type { User } from './user.d';

export async function getCurrentUser() {
  return backend.get<User>('/api/account');
}

export async function updatePassword(password: string) {
  return backend.post<void>('/api/account/password', { password });
}
