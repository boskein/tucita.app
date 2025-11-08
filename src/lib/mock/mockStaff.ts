import type { Employee } from '../types';
import { employees } from './store';
import { createOwnerUser } from './mockUser';

/**
 * Simulate network latency
 */
function delay(ms: number = 100): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms + Math.random() * 200));
}

export interface CreateEmployeeInput {
  name: string;
  role?: string;
  active?: boolean;
}

export async function listEmployees(tenantId: string): Promise<Employee[]> {
  await delay();
  const tenantEmployees = Array.from(employees.values()).filter(
    emp => emp.tenantId === tenantId
  );
  return tenantEmployees.sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export async function createEmployee(
  tenantId: string,
  data: CreateEmployeeInput
): Promise<Employee> {
  await delay();
  
  const id = `employee_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const employee: Employee = {
    id,
    tenantId,
    name: data.name,
    role: data.role,
    active: data.active ?? true,
    createdAt: new Date().toISOString(),
  };
  
  employees.set(id, employee);
  return employee;
}

export async function updateEmployee(
  id: string,
  data: Partial<CreateEmployeeInput>
): Promise<Employee> {
  await delay();
  
  const employee = employees.get(id);
  if (!employee) {
    throw new Error('Employee not found');
  }
  
  const updated: Employee = {
    ...employee,
    ...data,
  };
  
  employees.set(id, updated);
  return updated;
}

export async function deleteEmployee(id: string): Promise<void> {
  await delay();
  
  if (!employees.has(id)) {
    throw new Error('Employee not found');
  }
  
  employees.delete(id);
}

/**
 * Create default owner employee when tenant is created
 */
export async function createDefaultOwnerEmployee(
  tenantId: string,
  ownerName: string
): Promise<Employee> {
  return createEmployee(tenantId, {
    name: ownerName,
    role: 'Propietario',
    active: true,
  });
}
