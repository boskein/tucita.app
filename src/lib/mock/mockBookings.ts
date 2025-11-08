import type { Booking, BookingStatus } from '../types';
import { bookings, tenants } from './store';
import { computeSlots } from './mockSchedule';

/**
 * Simulate network latency
 */
function delay(ms: number = 100): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms + Math.random() * 200));
}

export interface CreateBookingInput {
  tenantId: string;
  serviceId: string;
  employeeId: string | null;
  date: string; // ISO date string
  time: string; // HH:mm format
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface BookingFilters {
  status?: BookingStatus;
  dateFrom?: string;
  dateTo?: string;
  employeeId?: string;
}

export async function listBookings(
  tenantId: string,
  filters?: BookingFilters
): Promise<Booking[]> {
  await delay();
  
  let tenantBookings = Array.from(bookings.values()).filter(
    b => b.tenantId === tenantId
  );
  
  if (filters) {
    if (filters.status) {
      tenantBookings = tenantBookings.filter(b => b.status === filters.status);
    }
    if (filters.dateFrom) {
      tenantBookings = tenantBookings.filter(b => b.date >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      tenantBookings = tenantBookings.filter(b => b.date <= filters.dateTo!);
    }
    if (filters.employeeId) {
      tenantBookings = tenantBookings.filter(b => b.employeeId === filters.employeeId);
    }
  }
  
  return tenantBookings.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.time.localeCompare(b.time);
  });
}

export async function createBooking(data: CreateBookingInput): Promise<Booking> {
  await delay(200);
  
  // Validate slot availability - data.tenantId is actually the tenant ID
  // We need to find the tenant by ID (not slug)
  const tenant = Array.from(tenants.values()).find(t => t.id === data.tenantId);
  if (!tenant) {
    throw new Error('Tenant not found');
  }
  
  // Check if slot is available
  const availableSlots = await computeSlots({
    tenant: { id: tenant.id, slug: tenant.slug, timezone: tenant.timezone },
    serviceId: data.serviceId,
    employeeId: data.employeeId,
    isoDate: data.date,
  });
  
  if (!availableSlots.includes(data.time)) {
    throw new Error('El horario seleccionado no está disponible');
  }
  
  const id = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const booking: Booking = {
    id,
    tenantId: data.tenantId,
    serviceId: data.serviceId,
    employeeId: data.employeeId,
    date: data.date,
    time: data.time,
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    customerPhone: data.customerPhone,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  
  bookings.set(id, booking);
  return booking;
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<Booking> {
  await delay();
  
  const booking = bookings.get(id);
  if (!booking) {
    throw new Error('Booking not found');
  }
  
  const updated: Booking = {
    ...booking,
    status,
  };
  
  bookings.set(id, updated);
  return updated;
}
