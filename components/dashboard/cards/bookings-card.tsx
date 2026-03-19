import { DashboardCard } from '../dashboard-card';
import type { UpcomingBooking } from '@/lib/dashboard/types';
import { findConversationByName } from '@/lib/messages/mock-data';
import { buildContactContext } from '@/lib/messages/use-start-contact-chat';

type BookingsCardProps = {
  upcomingBookings: UpcomingBooking[];
  insight?: string;
};

export function BookingsCard({ upcomingBookings }: BookingsCardProps) {
  const contactNames = [...new Set(upcomingBookings.map((b) => b.contactName))];
  const firstConvo = contactNames.length > 0 ? findConversationByName(contactNames[0]!) : undefined;
  const contactCtx = firstConvo ? buildContactContext(firstConvo) : undefined;

  const summary = [
    `${upcomingBookings.length} upcoming bookings:`,
    ...upcomingBookings.map((b) => `- ${b.title} with ${b.contactName} on ${b.date} at ${b.time}`),
    '',
    `Contacts referenced: ${contactNames.join(', ')}`,
  ].join('\n');

  return (
    <DashboardCard
      title="Bookings"
      description="Upcoming"
      value={String(upcomingBookings.length)}
      cta="View bookings"
      chatContext={{ sourceId: 'bookings', cardType: 'bookings', title: 'Bookings', summary }}
      chatContactContext={contactCtx}
    />
  );
}
