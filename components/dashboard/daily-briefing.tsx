'use client';

import type { DailyBriefing, BriefingItem } from '@/lib/dashboard/briefing';

type DailyBriefingProps = {
  briefing: DailyBriefing;
  onAction?: (prompt: string) => void;
};

function BriefingSection({
  title,
  items,
  icon,
  emptyText,
  onAction,
}: {
  title: string;
  items: BriefingItem[];
  icon: React.ReactNode;
  emptyText?: string;
  onAction?: (prompt: string) => void;
}) {
  if (items.length === 0 && !emptyText) return null;

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
        {icon}
        {title}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-400 dark:text-neutral-500">{emptyText}</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {items.map((item, i) => (
            <div
              key={i}
              className="group flex items-start justify-between gap-3 rounded-lg border border-neutral-100 bg-white px-3 py-2.5 dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{item.label}</p>
                <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{item.detail}</p>
              </div>
              {item.action && onAction && (
                <button
                  type="button"
                  onClick={() => onAction(item.action!.prompt)}
                  className="shrink-0 cursor-pointer rounded-md border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-600 opacity-0 transition-all hover:bg-neutral-100 group-hover:opacity-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
                >
                  {item.action.label}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DailyBriefingPanel({ briefing, onAction }: DailyBriefingProps) {
  return (
    <div className="mx-auto max-w-[960px] px-4 py-8">
      <h1 className="mb-1 text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
        {briefing.greeting}
      </h1>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        Here&apos;s what needs your attention today.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <BriefingSection
          title="Needs Action"
          items={briefing.urgentItems}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
          emptyText="Nothing urgent right now"
          onAction={onAction}
        />

        <BriefingSection
          title="Today's Schedule"
          items={briefing.todaySchedule}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
          emptyText="No appointments today"
          onAction={onAction}
        />

        <BriefingSection
          title="Follow Up"
          items={briefing.followUps}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          }
          onAction={onAction}
        />

        <BriefingSection
          title="Recent Wins"
          items={briefing.wins}
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          }
          emptyText="Wins are on the way"
        />
      </div>
    </div>
  );
}
