import { format, parse, addMinutes } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import type { TimeBlock } from './types';

/**
 * Format a date to 24-hour time string (HH:mm)
 */
export function formatTime24h(date: Date): string {
  return format(date, 'HH:mm');
}

/**
 * Parse a 24-hour time string (HH:mm) to a Date object (using today's date)
 */
export function parseTime24h(timeStr: string, baseDate: Date = new Date()): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Get available time slots for a day based on schedule blocks, service duration, and existing bookings
 */
export function getSlotsForDay(
  blocks: TimeBlock[] | 'closed',
  duration: number, // minutes
  bookings: Array<{ time: string }>, // existing bookings for this day
  timezone: string
): string[] {
  if (blocks === 'closed') {
    return [];
  }

  const slots: string[] = [];
  const bookedTimes = new Set(bookings.map(b => b.time));

  for (const block of blocks) {
    let currentTime = parseTime24h(block.start);
    const endTime = parseTime24h(block.end);

    while (true) {
      const slotEnd = addMinutes(currentTime, duration);
      if (slotEnd > endTime) {
        break;
      }

      const slotTimeStr = formatTime24h(currentTime);
      if (!bookedTimes.has(slotTimeStr)) {
        slots.push(slotTimeStr);
      }

      currentTime = addMinutes(currentTime, 15); // 15-minute intervals
    }
  }

  return slots;
}

/**
 * Check if a date is in the given timezone
 */
export function isDateInTimezone(date: Date, timezone: string): boolean {
  try {
    toZonedTime(new Date(), timezone);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get weekday number from a date (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 */
export function getWeekdayFromDate(date: Date): number {
  return date.getDay();
}

/**
 * Convert a date to a specific timezone
 */
export function toTimezone(date: Date, timezone: string): Date {
  try {
    return toZonedTime(date, timezone);
  } catch {
    return date;
  }
}

/**
 * Convert a date from a specific timezone to UTC
 */
export function fromTimezone(date: Date, timezone: string): Date {
  try {
    return fromZonedTime(date, timezone);
  } catch {
    return date;
  }
}

/**
 * Format date to ISO date string (YYYY-MM-DD)
 */
export function formatISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/**
 * Parse ISO date string (YYYY-MM-DD) to Date
 */
export function parseISODate(dateStr: string): Date {
  return parse(dateStr, 'yyyy-MM-dd', new Date());
}
