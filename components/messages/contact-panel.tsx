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

const activityRowStyle: Record<ActivityType, { color: string }> = {
  message: { color: 'bg-neutral-100 dark:bg-neutral-800' },
  booking: { color: 'bg-neutral-100 dark:bg-neutral-800' },
  note: { color: 'bg-neutral-100 dark:bg-neutral-800' },
  'status-change': { color: 'bg-neutral-100 dark:bg-neutral-800' },
  'tag-added': { color: 'bg-neutral-100 dark:bg-neutral-800' },
  created: { color: 'bg-neutral-100 dark:bg-neutral-800' },
};

const glyphClass = 'size-4 shrink-0 text-neutral-600 dark:text-neutral-400';

function ActivityTypeGlyph({ type }: { type: ActivityType }) {
  switch (type) {
    case 'message':
      return (
        <svg className={glyphClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    case 'booking':
      return (
        <svg className={glyphClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case 'note':
      return (
        <svg className={glyphClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case 'status-change':
      return (
        <svg className={glyphClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M23 4v6h-6" />
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
        </svg>
      );
    case 'tag-added':
      return (
        <svg className={glyphClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      );
    case 'created':
      return (
        <svg className={glyphClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      );
  }
}

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
                const style = activityRowStyle[event.type];
                return (
                  <div key={event.id} className="group relative flex gap-3 rounded-lg px-1 py-2 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50">
                    <div className={cn('relative z-10 flex size-[34px] shrink-0 items-center justify-center rounded-full', style.color)}>
                      <ActivityTypeGlyph type={event.type} />
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
