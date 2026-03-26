type Booking = {
  title: string;
  contactName: string;
  time: string;
  duration: number;
  notes?: string;
};

type UpcomingBooking = {
  title: string;
  contactName: string;
  date: string;
  time: string;
};

type FollowUp = {
  contactName: string;
  lastContactDate: string;
  daysSince: number;
  reason: string;
};

type ScheduleOutput = {
  date: string;
  todayBookings: Booking[];
  upcomingBookings: UpcomingBooking[];
  pendingFollowUps: FollowUp[];
  unreadMessages: number;
  unreadFrom: string[];
};

function formatDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function formatShortDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function urgencyColor(daysSince: number) {
  if (daysSince >= 14) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  if (daysSince >= 7) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
}

export function GetTodayScheduleResult({ data }: { data: ScheduleOutput }) {
  const hasBookings = data.todayBookings.length > 0;
  const hasFollowUps = data.pendingFollowUps.length > 0;
  const hasUpcoming = data.upcomingBookings.length > 0;
  const hasUnread = data.unreadMessages > 0;

  return (
    <div className="divide-y divide-neutral-100 bg-white dark:divide-neutral-800/60 dark:bg-neutral-950">
      {/* Date header */}
      <div className="px-4 py-2.5">
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
          {formatDate(data.date)}
        </p>
      </div>

      {/* Today's bookings */}
      <div className="px-4 py-3">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Today
        </p>
        {hasBookings ? (
          <div className="space-y-2">
            {data.todayBookings.map((b, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-xs font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
                  {b.time}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {b.title}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {b.contactName}
                    {b.duration && <span className="ml-1.5 text-neutral-400 dark:text-neutral-500">&middot; {b.duration} min</span>}
                  </p>
                  {b.notes && (
                    <p className="mt-0.5 text-xs text-neutral-400 italic dark:text-neutral-500">{b.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-neutral-400 dark:text-neutral-500">No bookings today</p>
        )}
      </div>

      {/* Unread messages */}
      {hasUnread && (
        <div className="flex items-center gap-3 px-4 py-2.5">
          <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {data.unreadMessages}
          </span>
          <p className="text-xs text-neutral-600 dark:text-neutral-300">
            Unread from {data.unreadFrom.join(', ')}
          </p>
        </div>
      )}

      {/* Pending follow-ups */}
      {hasFollowUps && (
        <div className="px-4 py-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Follow-ups
          </p>
          <div className="space-y-2">
            {data.pendingFollowUps.map((f, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {f.contactName}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {f.daysSince}d since last contact
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${urgencyColor(f.daysSince)}`}>
                  {f.reason}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming bookings */}
      {hasUpcoming && (
        <div className="px-4 py-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Coming up
          </p>
          <div className="space-y-1.5">
            {data.upcomingBookings.map((b, i) => (
              <div key={i} className="flex items-baseline justify-between gap-3 text-xs">
                <span className="truncate text-neutral-700 dark:text-neutral-300">
                  {b.title} &middot; {b.contactName}
                </span>
                <span className="shrink-0 tabular-nums text-neutral-400 dark:text-neutral-500">
                  {formatShortDate(b.date)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
