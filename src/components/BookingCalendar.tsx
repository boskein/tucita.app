import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import type { TimeBlock } from '@/lib/types';
import { getWeekdayFromDate, formatISODate } from '@/lib/date';

interface BookingCalendarProps {
  selectedDate?: Date;
  onSelectDate: (date: Date | undefined) => void;
  availableDates: Set<string>; // Set of ISO date strings
  timezone: string;
}

export default function BookingCalendar({
  selectedDate,
  onSelectDate,
  availableDates,
  timezone,
}: BookingCalendarProps) {
  const isDateDisabled = (date: Date): boolean => {
    const isoDate = formatISODate(date);
    return !availableDates.has(isoDate);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Selecciona una fecha</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Horarios en {timezone}
        </p>
      </div>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onSelectDate}
        disabled={isDateDisabled}
        initialFocus
      />
    </div>
  );
}
