import { getConversations } from '@/lib/messages/mock-data';
import type { Booking } from '@/lib/messages/types';

export type CalendarBooking = Booking & {
  contactName: string;
  contactCompany?: string;
};

export function getAllBookings(): CalendarBooking[] {
  const conversations = getConversations();
  const bookings: CalendarBooking[] = [];

  for (const convo of conversations) {
    for (const booking of convo.bookings) {
      bookings.push({
        ...booking,
        contactName: convo.contact.name,
        contactCompany: convo.contact.company,
      });
    }
  }

  return bookings;
}

export function getWeekBookings(weekStart: Date): CalendarBooking[] {
  const all = getAllBookings();
  const start = startOfDay(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return all.filter((b) => {
    const d = new Date(b.date + 'T00:00:00');
    return d >= start && d < end;
  });
}

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function parseTime(timeStr: string): { hour: number; minute: number } {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return { hour: 9, minute: 0 };
  let hour = parseInt(match[1]!, 10);
  const minute = parseInt(match[2]!, 10);
  const period = match[3]!.toUpperCase();
  if (period === 'PM' && hour !== 12) hour += 12;
  if (period === 'AM' && hour === 12) hour = 0;
  return { hour, minute };
}
