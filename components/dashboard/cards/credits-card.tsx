import { DashboardCard } from '../dashboard-card';
import { cn } from '@/lib/utils';
import type { AgentCreditUsage } from '@/lib/dashboard/types';

type CreditsCardProps = {
  totalCredits: number;
  creditsByAgent: AgentCreditUsage[];
  insight?: string;
};

export function CreditsCard({ totalCredits, creditsByAgent, insight }: CreditsCardProps) {
  const topAgents = creditsByAgent.slice(0, 5);
  const maxCredits = topAgents[0]?.credits ?? 1;

  return (
    <DashboardCard title="Credits" subtitle={`${totalCredits} used`} insight={insight}>
      {topAgents.length === 0 ? (
        <p className="py-3 text-center text-xs text-neutral-400">No credit usage yet</p>
      ) : (
        <div className="flex flex-col gap-2">
          {topAgents.map((agent) => (
            <div key={agent.agentId} className="flex flex-col gap-0.5">
              <div className="flex items-center justify-between">
                <span className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                  {agent.agentName}
                </span>
                <span className="shrink-0 text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  {agent.credits}
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                <div
                  className={cn('h-full rounded-full bg-neutral-900 dark:bg-neutral-100')}
                  style={{ width: `${(agent.credits / maxCredits) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}
