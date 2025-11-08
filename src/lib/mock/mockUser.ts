import type { User } from '../types';
import { users } from './store';

/**
 * Simulate network latency
 */
function delay(ms: number = 100): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms + Math.random() * 200));
}

export interface CreateOwnerUserInput {
  name: string;
  email: string;
}

export async function createOwnerUser(
  tenantId: string,
  data: CreateOwnerUserInput
): Promise<User> {
  await delay();
  
  const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const user: User = {
    id,
    tenantId,
    email: data.email,
    name: data.name,
    role: 'owner',
    createdAt: new Date().toISOString(),
  };
  
  users.set(id, user);
  return user;
}
