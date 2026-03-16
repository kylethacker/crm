'use client';

import { DashboardCard } from '../dashboard-card';
import { cn } from '@/lib/utils';
import { useActivityResolutions } from '@/lib/activity/use-resolutions';
import type { AgentActivity } from '@/lib/activity/types';
import { formatRelativeTime } from '@/lib/format';
import { agentNameMap } from '@/lib/apps/data';

type AttentionCardProps = {
  items: AgentActivity[];
  insight?: string;
};

export function AttentionCard({ items, insight }: AttentionCardProps) {
  const { resolutions, resolve } = useActivityResolutions();
  const unresolvedItems = items.filter((item) => !resolutions[item.id]);
  const count = unresolvedItems.length;

  return (
    <DashboardCard
      title="Needs Attention"
      subtitle={count === 0 ? 'All clear' : `${count} item${count !== 1 ? 's' : ''}`}
      insight={insight}
    >
      {count === 0 ? (
        <div className="flex flex-col items-center justify-center py-4 text-center">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400"><path d="M20 6 9 17l-5-5" /></svg>
          <p className="mt-1 text-sm text-neutral-400">Nothing needs your attention</p>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {unresolvedItems.map((item) => (
            <div
              key={item.id}
              className="group/item flex items-start gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
            >
              <div
                className={cn(
                  'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md text-xs',
                  item.status === 'failed'
                    ? 'bg-neutral-200 dark:bg-neutral-700'
                    : 'bg-neutral-100 dark:bg-neutral-800',
                )}
              >
                {item.status === 'failed' ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 4H6v16h4" /><path d="M18 4h-4v16h4" /></svg>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {item.description}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-neutral-400">
                    {agentNameMap.get(item.agentId) ?? item.agentId}
                    <span className="mx-1">·</span>
                    {formatRelativeTime(item.timestamp)}
                  </span>
                  <div className="ml-auto flex items-center gap-1 opacity-0 transition-opacity group-hover/item:opacity-100">
                    <button
                      type="button"
                      onClick={() => resolve(item.id, 'approved')}
                      className="rounded-md bg-neutral-900 px-2 py-0.5 text-xs font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                    >
                      {item.status === 'failed' ? 'Retry' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      onClick={() => resolve(item.id, 'dismissed')}
                      className="rounded-md px-2 py-0.5 text-xs font-medium text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
