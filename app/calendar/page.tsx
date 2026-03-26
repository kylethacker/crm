import { getAllBookings } from '@/lib/calendar/data';
import { WeekCalendar } from '@/components/calendar/week-calendar';

export const metadata = {
  title: 'Calendar',
};

export default function CalendarPage() {
  const bookings = getAllBookings();

  return <WeekCalendar bookings={bookings} />;
}
