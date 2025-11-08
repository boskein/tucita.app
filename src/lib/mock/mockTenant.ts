import type { Tenant, User } from '../types';
import { generateSlug } from '../subdomain';
import { createOwnerUser } from './mockUser';
import { createDefaultOwnerEmployee } from './mockStaff';
import { tenants, users } from './store';

/**
 * Simulate network latency
 */
function delay(ms: number = 150): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms + Math.random() * 250));
}

export interface CreateTenantInput {
  name: string;
  category?: string;
  timezone: string;
  ownerName: string;
  ownerEmail: string;
}

export async function createTenant(input: CreateTenantInput): Promise<Tenant> {
  await delay();
  
  const id = `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const slug = generateSlug(input.name);
  
  // Ensure slug is unique
  let finalSlug = slug;
  let counter = 1;
  while (tenants.has(finalSlug)) {
    finalSlug = `${slug}-${counter}`;
    counter++;
  }
  
  const tenant: Tenant = {
    id,
    slug: finalSlug,
    name: input.name,
    category: input.category,
    timezone: input.timezone,
    createdAt: new Date().toISOString(),
  };
  
  tenants.set(finalSlug, tenant);
  
  // Create owner user
  const ownerUser = await createOwnerUser(id, {
    name: input.ownerName,
    email: input.ownerEmail,
  });
  
  // Create owner employee
  await createDefaultOwnerEmployee(id, input.ownerName);
  
  return tenant;
}

export async function getTenantBySlug(slug: string): Promise<Tenant | null> {
  await delay();
  return tenants.get(slug) || null;
}
