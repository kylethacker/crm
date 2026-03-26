'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  getStartOfWeek,
  parseTime,
  type CalendarBooking,
} from '@/lib/calendar/data';
import type { BookingStatus } from '@/lib/messages/types';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOUR_START = 7;
const HOUR_END = 20;
const HOUR_HEIGHT = 72;
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

function formatHour(h: number) {
  const period = h >= 12 ? 'PM' : 'AM';
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display} ${period}`;
}

function formatDateShort(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const statusColors: Record<BookingStatus, { bg: string; border: string; text: string }> = {
  upcoming: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-l-blue-500',
    text: 'text-blue-900 dark:text-blue-100',
  },
  completed: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-l-emerald-500',
    text: 'text-emerald-900 dark:text-emerald-100',
  },
  cancelled: {
    bg: 'bg-neutral-50 dark:bg-neutral-900/40',
    border: 'border-l-neutral-400',
    text: 'text-neutral-500 dark:text-neutral-400',
  },
  'no-show': {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-l-amber-500',
    text: 'text-amber-900 dark:text-amber-100',
  },
};

const statusLabels: Record<BookingStatus, string> = {
  upcoming: 'Upcoming',
  completed: 'Completed',
  cancelled: 'Cancelled',
  'no-show': 'No-show',
};

type WeekCalendarProps = {
  bookings: CalendarBooking[];
};

export function WeekCalendar({ bookings }: WeekCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [weekStart, setWeekStart] = useState(() => getStartOfWeek(today));

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const weekLabel = useMemo(() => {
    const end = new Date(weekStart);
    end.setDate(end.getDate() + 6);
    const startMonth = weekStart.toLocaleDateString('en-US', { month: 'long' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'long' });
    const year = weekStart.getFullYear();
    if (startMonth === endMonth) {
      return `${startMonth} ${weekStart.getDate()} – ${end.getDate()}, ${year}`;
    }
    return `${formatDateShort(weekStart)} – ${formatDateShort(end)}, ${year}`;
  }, [weekStart]);

  const bookingsByDay = useMemo(() => {
    const map = new Map<string, CalendarBooking[]>();
    for (const day of weekDays) {
      const key = day.toISOString().slice(0, 10);
      map.set(key, []);
    }
    for (const b of bookings) {
      const arr = map.get(b.date);
      if (arr) arr.push(b);
    }
    return map;
  }, [bookings, weekDays]);

  const goToPrevWeek = () => {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const goToNextWeek = () => {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const goToToday = () => {
    setWeekStart(getStartOfWeek(new Date()));
  };

  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!gridRef.current) return;
    const now = new Date();
    const targetHour = Math.max(HOUR_START, now.getHours() - 1);
    const scrollTo = (targetHour - HOUR_START) * HOUR_HEIGHT;
    gridRef.current.scrollTop = scrollTo;
  }, []);

  const upcomingCount = bookings.filter((b) => b.status === 'upcoming').length;

  return (
    <div className="flex h-full flex-col bg-white dark:bg-neutral-950">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Calendar
          </h1>
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
            {upcomingCount} upcoming
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToToday}
            className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            Today
          </button>
          <div className="flex items-center">
            <button
              type="button"
              onClick={goToPrevWeek}
              className="flex size-8 items-center justify-center rounded-l-md border border-neutral-200 bg-white text-neutral-500 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
              aria-label="Previous week"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <button
              type="button"
              onClick={goToNextWeek}
              className="flex size-8 items-center justify-center rounded-r-md border border-l-0 border-neutral-200 bg-white text-neutral-500 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
              aria-label="Next week"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </div>
          <span className="ml-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {weekLabel}
          </span>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid shrink-0 grid-cols-[60px_repeat(7,1fr)] border-b border-neutral-200 dark:border-neutral-800">
        <div className="border-r border-neutral-200 dark:border-neutral-800" />
        {weekDays.map((day, i) => {
          const isToday = isSameDay(day, today);
          return (
            <div
              key={i}
              className={cn(
                'flex flex-col items-center gap-0.5 border-r border-neutral-200 py-2.5 last:border-r-0 dark:border-neutral-800',
              )}
            >
              <span className="text-[11px] font-medium tracking-wide text-neutral-500 dark:text-neutral-400">
                {DAY_LABELS[i]}
              </span>
              <span
                className={cn(
                  'flex size-7 items-center justify-center rounded-full text-sm font-semibold',
                  isToday
                    ? 'bg-blue-600 text-white'
                    : 'text-neutral-900 dark:text-neutral-100',
                )}
              >
                {day.getDate()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Time grid */}
      <div ref={gridRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="relative grid grid-cols-[60px_repeat(7,1fr)]">
          {/* Hour labels + grid lines */}
          <div className="relative">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="relative border-b border-r border-neutral-100 dark:border-neutral-800/60"
                style={{ height: HOUR_HEIGHT }}
              >
                <span className="absolute -top-2.5 right-2 text-[11px] text-neutral-400 dark:text-neutral-500">
                  {formatHour(hour)}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {weekDays.map((day, colIdx) => {
            const dateKey = day.toISOString().slice(0, 10);
            const dayBookings = bookingsByDay.get(dateKey) ?? [];
            const isToday = isSameDay(day, today);

            return (
              <div
                key={colIdx}
                className={cn(
                  'relative border-r border-neutral-100 last:border-r-0 dark:border-neutral-800/60',
                  isToday && 'bg-blue-50/30 dark:bg-blue-950/10',
                )}
              >
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="border-b border-neutral-100 dark:border-neutral-800/60"
                    style={{ height: HOUR_HEIGHT }}
                  />
                ))}

                {/* Now indicator */}
                {isToday && <NowIndicator />}

                {/* Booking blocks */}
                {dayBookings.map((booking) => (
                  <BookingBlock key={booking.id} booking={booking} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function NowIndicator() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  const hour = now.getHours();
  const minute = now.getMinutes();
  if (hour < HOUR_START || hour >= HOUR_END) return null;

  const top = (hour - HOUR_START) * HOUR_HEIGHT + (minute / 60) * HOUR_HEIGHT;

  return (
    <div className="pointer-events-none absolute right-0 left-0 z-10" style={{ top }}>
      <div className="relative flex items-center">
        <div className="absolute -left-1 size-2 rounded-full bg-red-500" />
        <div className="h-px w-full bg-red-500" />
      </div>
    </div>
  );
}

function BookingBlock({ booking }: { booking: CalendarBooking }) {
  const { hour, minute } = parseTime(booking.time);
  if (hour < HOUR_START || hour >= HOUR_END) return null;

  const top = (hour - HOUR_START) * HOUR_HEIGHT + (minute / 60) * HOUR_HEIGHT;
  const height = Math.max((booking.duration / 60) * HOUR_HEIGHT, 28);
  const colors = statusColors[booking.status];
  const isCompact = booking.duration <= 30;

  return (
    <div
      className={cn(
        'absolute right-1 left-1 z-5 overflow-hidden rounded-md border-l-[3px] px-2 transition-shadow hover:shadow-md',
        colors.bg,
        colors.border,
        isCompact ? 'py-0.5' : 'py-1.5',
      )}
      style={{ top, height }}
      title={`${booking.title} — ${booking.contactName}${booking.contactCompany ? ` (${booking.contactCompany})` : ''}\n${booking.time} · ${booking.duration}min · ${statusLabels[booking.status]}`}
    >
      <p
        className={cn(
          'truncate text-xs font-semibold leading-tight',
          colors.text,
          booking.status === 'cancelled' && 'line-through',
        )}
      >
        {booking.title}
      </p>
      {!isCompact && (
        <p className="mt-0.5 truncate text-[11px] text-neutral-500 dark:text-neutral-400">
          {booking.contactName}
          {booking.contactCompany ? ` · ${booking.contactCompany}` : ''}
        </p>
      )}
      {!isCompact && booking.duration > 30 && (
        <p className="mt-0.5 text-[10px] text-neutral-400 dark:text-neutral-500">
          {booking.time} · {booking.duration}min
        </p>
      )}
    </div>
  );
}
