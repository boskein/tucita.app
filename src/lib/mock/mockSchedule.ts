import type { Schedule, TimeBlock, WeeklyTemplate } from '../types';
import { schedules } from './store';
import { getSlotsForDay } from '../date';
import { listServices } from './mockServices';
import { listBookings } from './mockBookings';
import { getTenantBySlug } from './mockTenant';

/**
 * Simulate network latency
 */
function delay(ms: number = 100): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms + Math.random() * 200));
}

function getScheduleKey(tenantId: string, employeeId: string | null): string {
  return `${tenantId}_${employeeId ?? 'business'}`;
}

export async function getBusinessSchedule(tenantId: string): Promise<Schedule> {
  await delay();
  const key = getScheduleKey(tenantId, null);
  let schedule = schedules.get(key);
  
  if (!schedule) {
    schedule = {
      tenantId,
      employeeId: null,
      weeklyTemplate: {},
      exceptions: {},
    };
    schedules.set(key, schedule);
  }
  
  return schedule;
}

export async function getEmployeeSchedule(
  tenantId: string,
  employeeId: string
): Promise<Schedule> {
  await delay();
  const key = getScheduleKey(tenantId, employeeId);
  let schedule = schedules.get(key);
  
  if (!schedule) {
    schedule = {
      tenantId,
      employeeId,
      weeklyTemplate: {},
      exceptions: {},
    };
    schedules.set(key, schedule);
  }
  
  return schedule;
}

export async function setBusinessWeeklyTemplate(
  tenantId: string,
  weekly: WeeklyTemplate
): Promise<Schedule> {
  await delay();
  const schedule = await getBusinessSchedule(tenantId);
  schedule.weeklyTemplate = weekly;
  schedules.set(getScheduleKey(tenantId, null), schedule);
  return schedule;
}

export async function setEmployeeWeeklyTemplate(
  tenantId: string,
  employeeId: string,
  weekly: WeeklyTemplate
): Promise<Schedule> {
  await delay();
  const schedule = await getEmployeeSchedule(tenantId, employeeId);
  schedule.weeklyTemplate = weekly;
  schedules.set(getScheduleKey(tenantId, employeeId), schedule);
  return schedule;
}

export async function setException(
  tenantId: string,
  employeeId: string | null,
  isoDate: string,
  blocks: TimeBlock[] | 'closed'
): Promise<Schedule> {
  await delay();
  const schedule = employeeId
    ? await getEmployeeSchedule(tenantId, employeeId)
    : await getBusinessSchedule(tenantId);
  
  schedule.exceptions[isoDate] = blocks;
  schedules.set(getScheduleKey(tenantId, employeeId), schedule);
  return schedule;
}

export interface ComputeSlotsInput {
  tenant: { id: string; slug: string; timezone: string };
  serviceId: string;
  employeeId: string | null;
  isoDate: string;
}

export async function computeSlots(input: ComputeSlotsInput): Promise<string[]> {
  await delay(200);
  
  const { tenant, serviceId, employeeId, isoDate } = input;
  
  // Get service to know duration
  const services = await listServices(tenant.id);
  const service = services.find(s => s.id === serviceId);
  if (!service) {
    return [];
  }
  
  // Get schedule (employee-specific or business)
  const schedule = employeeId
    ? await getEmployeeSchedule(tenant.id, employeeId)
    : await getBusinessSchedule(tenant.id);
  
  // Get weekday (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const date = new Date(isoDate + 'T00:00:00');
  const weekday = date.getDay();
  
  // Check for exception first
  let blocks: TimeBlock[] | 'closed' = schedule.exceptions[isoDate];
  
  // If no exception, use weekly template
  if (blocks === undefined) {
    blocks = schedule.weeklyTemplate[weekday] || [];
  }
  
  if (blocks === 'closed' || blocks.length === 0) {
    return [];
  }
  
  // Get existing bookings for this day
  const allBookings = await listBookings(tenant.id);
  const dayBookings = allBookings.filter(
    b => b.date === isoDate && 
         b.status !== 'cancelled' &&
         (employeeId === null || b.employeeId === employeeId)
  );
  
  // Generate slots
  return getSlotsForDay(blocks, service.duration, dayBookings, tenant.timezone);
}
