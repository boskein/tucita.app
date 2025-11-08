import type { Tenant, User, Employee, Service, Schedule, Booking } from '../types';

// LocalStorage keys
const STORAGE_KEYS = {
  tenants: 'tucitas_tenants',
  users: 'tucitas_users',
  employees: 'tucitas_employees',
  services: 'tucitas_services',
  schedules: 'tucitas_schedules',
  bookings: 'tucitas_bookings',
};

// Helper to create a persistent Map
function createPersistentMap<T>(storageKey: string): Map<string, T> {
  if (typeof window === 'undefined') {
    return new Map<string, T>();
  }
  
  // Load from localStorage
  const stored = localStorage.getItem(storageKey);
  const map = new Map<string, T>(stored ? JSON.parse(stored) : []);
  
  // Override set to persist
  const originalSet = map.set.bind(map);
  map.set = (key: string, value: T) => {
    const result = originalSet(key, value);
    localStorage.setItem(storageKey, JSON.stringify(Array.from(map.entries())));
    return result;
  };
  
  // Override delete to persist
  const originalDelete = map.delete.bind(map);
  map.delete = (key: string) => {
    const result = originalDelete(key);
    localStorage.setItem(storageKey, JSON.stringify(Array.from(map.entries())));
    return result;
  };
  
  // Override clear to persist
  const originalClear = map.clear.bind(map);
  map.clear = () => {
    originalClear();
    localStorage.setItem(storageKey, JSON.stringify([]));
  };
  
  return map;
}

// Persistent storage
export const tenants = createPersistentMap<Tenant>(STORAGE_KEYS.tenants);
export const users = createPersistentMap<User>(STORAGE_KEYS.users);
export const employees = createPersistentMap<Employee>(STORAGE_KEYS.employees);
export const services = createPersistentMap<Service>(STORAGE_KEYS.services);
export const schedules = createPersistentMap<Schedule>(STORAGE_KEYS.schedules);
export const bookings = createPersistentMap<Booking>(STORAGE_KEYS.bookings);
