'use client';

import { cn } from '@/lib/utils';
import type { Contact, Booking, ActivityEvent, ActivityType, BookingStatus } from '@/lib/messages/types';
import { formatRelativeTime } from '@/lib/format';

type ContactPanelProps = {
  contact: Contact;
  bookings: Booking[];
  activity: ActivityEvent[];
};

const statusLabels: Record<string, { label: string; color: string }> = {
  customer: { label: 'Customer', color: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300' },
  lead: { label: 'Lead', color: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300' },
  prospect: { label: 'Prospect', color: 'bg-neutral-200 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300' },
};

const activityIcons: Record<ActivityType, { icon: string; color: string }> = {
  message: { icon: '💬', color: 'bg-neutral-100 dark:bg-neutral-800' },
  booking: { icon: '📅', color: 'bg-neutral-100 dark:bg-neutral-800' },
  note: { icon: '📝', color: 'bg-neutral-100 dark:bg-neutral-800' },
  'status-change': { icon: '🔄', color: 'bg-neutral-100 dark:bg-neutral-800' },
  'tag-added': { icon: '🏷️', color: 'bg-neutral-100 dark:bg-neutral-800' },
  created: { icon: '✨', color: 'bg-neutral-100 dark:bg-neutral-800' },
};

const bookingStatusStyles: Record<BookingStatus, { label: string; dot: string }> = {
  upcoming: { label: 'Upcoming', dot: 'bg-neutral-900 dark:bg-neutral-100' },
  completed: { label: 'Completed', dot: 'bg-neutral-500' },
  cancelled: { label: 'Cancelled', dot: 'bg-neutral-400' },
  'no-show': { label: 'No Show', dot: 'bg-neutral-300 dark:bg-neutral-600' },
};

function formatBookingDate(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mb-3 text-xs font-medium text-neutral-400">
      {children}
    </h4>
  );
}

export function ContactPanel({ contact, bookings, activity }: ContactPanelProps) {
  const status = statusLabels[contact.status];

  const sortedBookings = [...bookings].sort((a, b) => {
    if (a.status === 'upcoming' && b.status !== 'upcoming') return -1;
    if (a.status !== 'upcoming' && b.status === 'upcoming') return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const totalRevenue = bookings
    .filter((b) => b.amount && b.status === 'completed')
    .reduce((sum, b) => sum + (b.amount ?? 0), 0);

  const completedBookings = bookings.filter((b) => b.status === 'completed').length;
  const upcomingCount = bookings.filter((b) => b.status === 'upcoming').length;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl px-6 py-6">
        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-neutral-200 px-4 py-3 dark:border-neutral-800">
            <p className="text-xs font-medium text-neutral-400">Status</p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className={cn('inline-flex rounded-full px-2 py-0.5 text-xs font-medium', status?.color)}>
                {status?.label}
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-neutral-200 px-4 py-3 dark:border-neutral-800">
            <p className="text-xs font-medium text-neutral-400">Bookings</p>
            <p className="mt-1.5 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {completedBookings}
              {upcomingCount > 0 && (
                <span className="ml-1 text-sm font-normal text-neutral-500">+{upcomingCount} upcoming</span>
              )}
            </p>
          </div>
          <div className="rounded-xl border border-neutral-200 px-4 py-3 dark:border-neutral-800">
            <p className="text-xs font-medium text-neutral-400">Revenue</p>
            <p className="mt-1.5 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {totalRevenue > 0 ? `$${totalRevenue.toLocaleString()}` : '—'}
            </p>
          </div>
        </div>

        {/* Contact details + meta */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-neutral-200 px-4 py-3 dark:border-neutral-800">
            <SectionHeading>Contact Information</SectionHeading>
            <dl className="space-y-2">
              <div>
                <dt className="text-xs text-neutral-500 dark:text-neutral-400">Phone</dt>
                <dd className="mt-0.5 text-sm text-neutral-900 dark:text-neutral-100">{contact.phone}</dd>
              </div>
              {contact.email && (
                <div>
                  <dt className="text-xs text-neutral-500 dark:text-neutral-400">Email</dt>
                  <dd className="mt-0.5 text-sm text-neutral-900 dark:text-neutral-100">{contact.email}</dd>
                </div>
              )}
              {contact.company && (
                <div>
                  <dt className="text-xs text-neutral-500 dark:text-neutral-400">Company</dt>
                  <dd className="mt-0.5 text-sm text-neutral-900 dark:text-neutral-100">{contact.company}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="flex flex-col gap-3">
            {contact.tags && contact.tags.length > 0 && (
              <div className="rounded-xl border border-neutral-200 px-4 py-3 dark:border-neutral-800">
                <SectionHeading>Tags</SectionHeading>
                <div className="flex flex-wrap gap-1.5">
                  {contact.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-neutral-200 px-4 py-3 dark:border-neutral-800">
              <SectionHeading>Dates</SectionHeading>
              <dl className="space-y-2">
                {contact.lastContacted && (
                  <div>
                    <dt className="text-xs text-neutral-500 dark:text-neutral-400">Last Contacted</dt>
                    <dd className="mt-0.5 text-sm text-neutral-900 dark:text-neutral-100">{formatDate(contact.lastContacted)}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-neutral-500 dark:text-neutral-400">Created</dt>
                  <dd className="mt-0.5 text-sm text-neutral-900 dark:text-neutral-100">{formatDate(contact.createdAt)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Notes */}
        {contact.notes && (
          <div className="mb-6 rounded-xl border border-neutral-200 px-4 py-3 dark:border-neutral-800">
            <SectionHeading>Notes</SectionHeading>
            <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
              {contact.notes}
            </p>
          </div>
        )}

        {/* All bookings */}
        <div className="mb-6">
          <SectionHeading>Bookings ({bookings.length})</SectionHeading>
          {sortedBookings.length > 0 ? (
            <div className="flex flex-col gap-2">
              {sortedBookings.map((booking) => {
                const style = bookingStatusStyles[booking.status];
                const isUpcoming = booking.status === 'upcoming';
                return (
                  <div
                    key={booking.id}
                    className={cn(
                      'rounded-lg border px-4 py-3',
                      isUpcoming
                        ? 'border-neutral-300 bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800/30'
                        : 'border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/30',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className={cn('text-sm font-medium', isUpcoming ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-400')}>
                        {booking.title}
                      </p>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span className={cn('size-1.5 rounded-full', style.dot)} />
                        <span className="text-xs text-neutral-500">{style.label}</span>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
                      <span>{formatBookingDate(booking.date)}</span>
                      <span>·</span>
                      <span>{booking.time}</span>
                      <span>·</span>
                      <span>{booking.duration}m</span>
                    </div>
                    {booking.amount != null && booking.amount > 0 && (
                      <p className="mt-1 text-xs font-medium text-neutral-900 dark:text-neutral-100">
                        ${booking.amount.toLocaleString()}
                      </p>
                    )}
                    {booking.notes && (
                      <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">{booking.notes}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-neutral-400 italic">No bookings yet</p>
          )}
        </div>

        {/* Activity feed */}
        <div>
          <SectionHeading>Activity</SectionHeading>
          <div className="relative">
            <div className="absolute left-[17px] top-2 bottom-2 w-px bg-neutral-200 dark:bg-neutral-800" />

            <div className="flex flex-col gap-0.5">
              {activity.map((event) => {
                const style = activityIcons[event.type];
                return (
                  <div key={event.id} className="group relative flex gap-3 rounded-lg px-1 py-2 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                    <div className={cn('relative z-10 flex size-[34px] shrink-0 items-center justify-center rounded-full text-sm', style.color)}>
                      {style.icon}
                    </div>
                    <div className="min-w-0 flex-1 pt-1">
                      <p className="text-sm text-neutral-700 dark:text-neutral-300">
                        {event.description}
                      </p>
                      <p className="mt-0.5 text-xs text-neutral-400">
                        {formatRelativeTime(event.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
