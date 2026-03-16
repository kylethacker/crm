import { DashboardCard } from '../dashboard-card';
import type { UpcomingBooking } from '@/lib/dashboard/types';
import { findConversationByName } from '@/lib/messages/mock-data';
import { buildContactContext } from '@/lib/messages/use-start-contact-chat';

type BookingsCardProps = {
  upcomingBookings: UpcomingBooking[];
  insight?: string;
};

function formatDate(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function BookingsCard({ upcomingBookings, insight }: BookingsCardProps) {
  const contactNames = [...new Set(upcomingBookings.map((b) => b.contactName))];
  const firstConvo = contactNames.length > 0 ? findConversationByName(contactNames[0]!) : undefined;
  const contactCtx = firstConvo ? buildContactContext(firstConvo) : undefined;

  const summary = [
    `${upcomingBookings.length} upcoming bookings:`,
    ...upcomingBookings.map((b) => `- ${b.title} with ${b.contactName} on ${formatDate(b.date)} at ${b.time}`),
    '',
    `Contacts referenced: ${contactNames.join(', ')}`,
  ].join('\n');

  return (
    <DashboardCard
      title="Bookings"
      subtitle={`${upcomingBookings.length} upcoming`}
      chatContext={{ sourceId: 'bookings', cardType: 'bookings', title: 'Bookings', summary }}
      chatContactContext={contactCtx}
    >
      {upcomingBookings.length === 0 ? (
        <p className="py-3 text-center text-xs text-neutral-400">No upcoming bookings</p>
      ) : (
        <div className="flex flex-col">
          {upcomingBookings.slice(0, 4).map((b) => (
            <div
              key={b.id}
              className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            >
              <div className="flex size-7 shrink-0 flex-col items-center justify-center rounded-md bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)] dark:bg-neutral-800 dark:shadow-[0_1px_4px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.05)]">
                <span className="text-[8px] font-bold leading-none text-neutral-500 dark:text-neutral-400">
                  {formatDate(b.date).split(' ')[0]}
                </span>
                <span className="text-xs font-bold leading-tight text-neutral-700 dark:text-neutral-300">
                  {formatDate(b.date).split(' ')[1]}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-neutral-700 dark:text-neutral-300">{b.title}</p>
                <p className="truncate text-xs text-neutral-400">
                  {b.contactName} · {b.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
