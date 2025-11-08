import type { Tenant, User, Employee, Service, Schedule, Booking } from '../types';

// In-memory storage
export const tenants = new Map<string, Tenant>();
export const users = new Map<string, User>();
export const employees = new Map<string, Employee>();
export const services = new Map<string, Service>();
export const schedules = new Map<string, Schedule>();
export const bookings = new Map<string, Booking>();
