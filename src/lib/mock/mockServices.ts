import type { Service } from '../types';
import { services } from './store';

/**
 * Simulate network latency
 */
function delay(ms: number = 100): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms + Math.random() * 200));
}

export interface CreateServiceInput {
  name: string;
  duration: number;
  price?: number;
  employeeIds: string[];
  active?: boolean;
}

export async function listServices(tenantId: string): Promise<Service[]> {
  await delay();
  const tenantServices = Array.from(services.values()).filter(
    svc => svc.tenantId === tenantId
  );
  return tenantServices.sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export async function createService(
  tenantId: string,
  data: CreateServiceInput
): Promise<Service> {
  await delay();
  
  const id = `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const service: Service = {
    id,
    tenantId,
    name: data.name,
    duration: data.duration,
    price: data.price,
    employeeIds: data.employeeIds || [],
    active: data.active ?? true,
    createdAt: new Date().toISOString(),
  };
  
  services.set(id, service);
  return service;
}

export async function updateService(
  id: string,
  data: Partial<CreateServiceInput>
): Promise<Service> {
  await delay();
  
  const service = services.get(id);
  if (!service) {
    throw new Error('Service not found');
  }
  
  const updated: Service = {
    ...service,
    ...data,
  };
  
  services.set(id, updated);
  return updated;
}

export async function deleteService(id: string): Promise<void> {
  await delay();
  
  if (!services.has(id)) {
    throw new Error('Service not found');
  }
  
  services.delete(id);
}
