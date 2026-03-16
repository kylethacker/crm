'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { AgentActivity } from '@/lib/activity/types';
import { formatRelativeTime } from '@/lib/format';
import { agentNameMap } from '@/lib/apps/data';
import { ACTIVITY_STATUS_DOT } from '@/lib/status';

type ActivitySidebarProps = {
  activities: AgentActivity[];
  totalCount: number;
  insight?: string;
};

export function ActivitySidebar({ activities, totalCount, insight }: ActivitySidebarProps) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div
      className={cn(
        'flex h-full shrink-0 flex-col border-l border-neutral-200 bg-white transition-[width] duration-200 ease-in-out dark:border-neutral-800 dark:bg-neutral-950',
        collapsed ? 'w-12' : 'w-80',
      )}
    >
      <div className="flex shrink-0 items-center gap-2 border-b border-neutral-100 px-3 py-3 dark:border-neutral-800/60">
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
          aria-label={collapsed ? 'Expand activity feed' : 'Collapse activity feed'}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={cn('transition-transform duration-200', collapsed && 'rotate-180')}
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              Activity
            </h3>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              {totalCount} events
            </p>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {insight && (
            <div className="mb-3 rounded-lg border border-neutral-200 bg-neutral-50/50 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800/20">
              <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                {insight}
              </p>
            </div>
          )}

          {activities.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-400">No recent activity</p>
          ) : (
            <div className="flex flex-col gap-0.5">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-start gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                >
                  <span
                    className={cn('mt-1.5 inline-block size-1.5 shrink-0 rounded-full', ACTIVITY_STATUS_DOT[act.status])}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">
                      {act.description}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-400">
                      {agentNameMap.get(act.agentId) ?? act.agentId}
                      <span className="mx-1">·</span>
                      {formatRelativeTime(act.timestamp)}
                      {act.creditsUsed > 0 && (
                        <>
                          <span className="mx-1">·</span>
                          {act.creditsUsed} cr
                        </>
                      )}
                    </p>
                  </div>
                </div>
              ))}
              <p className="mt-1 py-1.5 text-center text-xs text-neutral-400">
                {totalCount} total activities
              </p>
            </div>
          )}
        </div>
      )}

      {collapsed && (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-3 flex cursor-pointer flex-col items-center gap-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          aria-label="Expand activity feed"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="1" />
            <circle cx="12" cy="5" r="1" />
            <circle cx="12" cy="19" r="1" />
          </svg>
        </button>
      )}
    </div>
  );
}
