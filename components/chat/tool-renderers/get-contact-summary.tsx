import { formatCurrency } from '@/lib/format';

type Contact = {
  id: string;
  name: string;
  phone: string;
  email: string;
  company?: string;
  status: string;
  tags: string[];
  notes?: string;
  createdAt: string;
};

type Message = {
  text: string;
  direction: 'inbound' | 'outbound';
  timestamp: string;
};

type Booking = {
  title: string;
  date: string;
  time: string;
  notes?: string;
};

type Activity = {
  type: string;
  description: string;
  timestamp: string;
};

type ContactSummaryFound = {
  found: true;
  contact: Contact;
  totalRevenue: number;
  daysSinceContact: number | null;
  relationshipHealth: 'active' | 'cooling' | 'at-risk' | 'unknown';
  messageCount: number;
  recentMessages: Message[];
  upcomingBookings: Booking[];
  completedBookings: number;
  recentActivity: Activity[];
};

type ContactSummaryNotFound = {
  found: false;
  name: string;
  message: string;
};

type ContactSummaryOutput = ContactSummaryFound | ContactSummaryNotFound;

const healthConfig: Record<string, { label: string; className: string }> = {
  active: {
    label: 'Active',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  cooling: {
    label: 'Cooling',
    className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  },
  'at-risk': {
    label: 'At Risk',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  unknown: {
    label: 'Unknown',
    className: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
  },
};

const statusColors: Record<string, string> = {
  customer: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  lead: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  prospect: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

function formatShortDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTimestamp(ts: string) {
  const d = new Date(ts);
  const diffMs = Date.now() - d.getTime();
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function GetContactSummaryResult({ data }: { data: ContactSummaryOutput }) {
  if (!data.found) {
    return (
      <div className="rounded-xl border border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{data.message}</p>
      </div>
    );
  }

  const { contact, totalRevenue, daysSinceContact, relationshipHealth, messageCount, recentMessages, upcomingBookings, completedBookings, recentActivity } = data;
  const health = healthConfig[relationshipHealth] ?? healthConfig.unknown;

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      {/* Header — name, status, health */}
      <div className="flex items-start gap-3 px-4 py-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
          {contact.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {contact.name}
            </p>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${statusColors[contact.status] ?? 'bg-neutral-100 text-neutral-500'}`}>
              {contact.status}
            </span>
            {health && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${health.className}`}>
                {health.label}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {contact.email}
            {contact.company && <> &middot; {contact.company}</>}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 divide-x divide-neutral-100 border-y border-neutral-100 dark:divide-neutral-800 dark:border-neutral-800">
        <div className="px-4 py-2.5 text-center">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {formatCurrency(totalRevenue)}
          </p>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Revenue</p>
        </div>
        <div className="px-4 py-2.5 text-center">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {messageCount}
          </p>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Messages</p>
        </div>
        <div className="px-4 py-2.5 text-center">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {daysSinceContact != null ? `${daysSinceContact}d` : '—'}
          </p>
          <p className="text-[10px] text-neutral-400 dark:text-neutral-500">Last contact</p>
        </div>
      </div>

      {/* Tags */}
      {contact.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 border-b border-neutral-100 px-4 py-2.5 dark:border-neutral-800">
          {contact.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Upcoming bookings */}
      {upcomingBookings.length > 0 && (
        <div className="border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Upcoming
          </p>
          <div className="space-y-2">
            {upcomingBookings.map((b, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0 text-xs font-medium tabular-nums text-neutral-900 dark:text-neutral-100">
                  {b.time}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {b.title}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    {formatShortDate(b.date)}
                  </p>
                  {b.notes && (
                    <p className="mt-0.5 text-xs text-neutral-400 italic dark:text-neutral-500">
                      {b.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent messages */}
      {recentMessages.length > 0 && (
        <div className="border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Recent messages
          </p>
          <div className="space-y-2">
            {recentMessages.map((m, i) => (
              <div key={i} className="flex items-start gap-2">
                <span
                  className={`mt-1 size-1.5 shrink-0 rounded-full ${
                    m.direction === 'inbound'
                      ? 'bg-blue-400'
                      : 'bg-neutral-300 dark:bg-neutral-600'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
                    {m.text}
                  </p>
                  <p className="mt-0.5 text-[10px] text-neutral-400 dark:text-neutral-500">
                    {formatTimestamp(m.timestamp)}
                    {m.direction === 'inbound' ? ` — ${contact.name.split(' ')[0]}` : ' — You'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent activity */}
      {recentActivity.length > 0 && (
        <div className="px-4 py-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            Activity
          </p>
          <div className="space-y-1.5">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-baseline justify-between gap-3 text-xs">
                <span className="truncate text-neutral-700 dark:text-neutral-300">
                  {a.description}
                </span>
                <span className="shrink-0 tabular-nums text-neutral-400 dark:text-neutral-500">
                  {formatTimestamp(a.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {contact.notes && (
        <div className="border-t border-neutral-100 px-4 py-2.5 dark:border-neutral-800">
          <p className="text-xs text-neutral-400 italic dark:text-neutral-500">{contact.notes}</p>
        </div>
      )}
    </div>
  );
}
