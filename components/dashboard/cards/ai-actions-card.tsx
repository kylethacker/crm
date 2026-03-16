import { DashboardCard } from '../dashboard-card';
import { cn } from '@/lib/utils';
import type { AgentActionSummary } from '@/lib/dashboard/types';

type AiActionsCardProps = {
  actions: AgentActionSummary[];
  insight?: string;
};

export function AiActionsCard({ actions, insight }: AiActionsCardProps) {
  const totalCompleted = actions.reduce((sum, a) => sum + a.completedCount, 0);
  const totalPending = actions.reduce((sum, a) => sum + a.pendingCount, 0);

  return (
    <DashboardCard
      title="AI Actions"
      subtitle={`${totalCompleted} done · ${totalPending} pending`}
      insight={insight}
    >
      {actions.length === 0 ? (
        <p className="py-3 text-center text-xs text-neutral-400">No agent actions yet</p>
      ) : (
        <div className="flex flex-col">
          {actions.slice(0, 8).map((action) => (
            <div
              key={action.agentId}
              className="flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded bg-neutral-100 text-xs font-bold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                {action.completedCount}
              </span>
              <span className="min-w-0 flex-1 truncate text-xs text-neutral-600 dark:text-neutral-400">
                {action.agentName}
              </span>
              {action.pendingCount > 0 && (
                <span className={cn(
                  'shrink-0 rounded px-1 py-px text-xs font-medium',
                  'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
                )}>
                  {action.pendingCount}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
