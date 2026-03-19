import { tool } from 'ai';
import { z } from 'zod';
import { getConversations } from '@/lib/messages/mock-data';
import { businessConfig } from '@/lib/business/config';

export const getCalendarSlotsTool = tool({
  description:
    'Find open and booked time slots within a date range. Use this to identify gaps in the schedule for booking opportunities or to plan the week.',
  strict: true,
  inputSchema: z.object({
    startDate: z.string().describe('Start date in YYYY-MM-DD format'),
    endDate: z.string().describe('End date in YYYY-MM-DD format'),
    minDurationMinutes: z
      .number()
      .default(30)
      .describe('Minimum duration in minutes for an open slot to be returned'),
  }),
  execute: async ({ startDate, endDate, minDurationMinutes }) => {
    const conversations = getConversations();
    const { businessHours } = businessConfig;

    // Collect all booked slots in the date range
    const bookedSlots: Array<{
      date: string;
      time: string;
      contactName: string;
      title: string;
      duration: number;
    }> = [];

    for (const conv of conversations) {
      for (const booking of conv.bookings) {
        if (
          booking.status === 'upcoming' &&
          booking.date >= startDate &&
          booking.date <= endDate
        ) {
          bookedSlots.push({
            date: booking.date,
            time: booking.time,
            contactName: conv.contact.name,
            title: booking.title,
            duration: booking.duration,
          });
        }
      }
    }

    bookedSlots.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return parseTimeAmPm(a.time) - parseTimeAmPm(b.time);
    });

    // Calculate open slots for each business day in range
    const openSlots: Array<{
      date: string;
      startTime: string;
      endTime: string;
      durationMinutes: number;
    }> = [];

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const current = new Date(startDate + 'T00:00:00');
    const end = new Date(endDate + 'T00:00:00');

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0]!;
      const dayName = dayNames[current.getDay()]!;

      if (businessHours.days.includes(dayName)) {
        const dayBookings = bookedSlots
          .filter((s) => s.date === dateStr)
          .sort((a, b) => parseTimeAmPm(a.time) - parseTimeAmPm(b.time));

        // Convert business hours to minutes from midnight
        const openMinutes = parseTime(businessHours.open);
        const closeMinutes = parseTime(businessHours.close);

        let cursor = openMinutes;

        for (const booking of dayBookings) {
          const bookingStart = parseTimeAmPm(booking.time);
          if (bookingStart > cursor) {
            const gap = bookingStart - cursor;
            if (gap >= minDurationMinutes) {
              openSlots.push({
                date: dateStr,
                startTime: formatMinutes(cursor),
                endTime: formatMinutes(bookingStart),
                durationMinutes: gap,
              });
            }
          }
          cursor = Math.max(cursor, bookingStart + booking.duration);
        }

        // Gap after last booking until close
        if (closeMinutes > cursor) {
          const gap = closeMinutes - cursor;
          if (gap >= minDurationMinutes) {
            openSlots.push({
              date: dateStr,
              startTime: formatMinutes(cursor),
              endTime: formatMinutes(closeMinutes),
              durationMinutes: gap,
            });
          }
        }
      }

      current.setDate(current.getDate() + 1);
    }

    return {
      openSlots,
      bookedSlots: bookedSlots.map(({ date, time, contactName, title }) => ({
        date,
        time,
        contactName,
        title,
      })),
    };
  },
});

function parseTime(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h! * 60 + m!;
}

function parseTimeAmPm(time: string): number {
  const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return parseTime(time);
  let h = parseInt(match[1]!, 10);
  const m = parseInt(match[2]!, 10);
  const period = match[3]!.toUpperCase();
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h * 60 + m;
}

function formatMinutes(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayH}:${m.toString().padStart(2, '0')} ${period}`;
}
