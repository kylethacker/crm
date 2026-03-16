import { DashboardCard } from '../dashboard-card';
import { cn } from '@/lib/utils';
import type { AgentActivity } from '@/lib/activity/types';
import { formatRelativeTime } from '@/lib/format';
import { agentNameMap } from '@/lib/apps/data';
import { ACTIVITY_STATUS_DOT } from '@/lib/status';

type AgentActivityCardProps = {
  activities: AgentActivity[];
  totalCount: number;
  insight?: string;
};

export function AgentActivityCard({ activities, totalCount, insight }: AgentActivityCardProps) {
  return (
    <DashboardCard
      title="Agent Activity"
      subtitle={`${totalCount} total events`}
      insight={insight}
    >
      {activities.length === 0 ? (
        <p className="py-4 text-center text-sm text-neutral-400">No recent activity</p>
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
                <p className="truncate text-sm text-neutral-700 dark:text-neutral-300">
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
            Recent agent activity
          </p>
        </div>
      )}
    </DashboardCard>
  );
}
