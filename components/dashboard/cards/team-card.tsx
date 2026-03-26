'use client';

import Link from 'next/link';
import type { ActiveAgent } from '@/lib/marketplace/types';
import { getAgentDef, formatTopOutcome } from '@/lib/marketplace/data';
import { MarketplaceAgentIcon } from '@/components/marketplace/agent-icon';

type TeamCardProps = {
  activeAgents: ActiveAgent[];
  availableCount: number;
  pendingCount: number;
};

export function TeamCard({ activeAgents, availableCount, pendingCount }: TeamCardProps) {
  return (
    <Link
      href="/team"
      className="flex flex-col rounded-lg border border-neutral-200/70 bg-app-surface px-5 py-4 transition-colors hover:bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/70"
    >
      <h3 className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
        Your Agents
      </h3>

      {/* Active agents with outcomes */}
      <div className="mt-3 flex flex-col gap-2.5">
        {activeAgents.filter((a) => !a.paused).map((a) => {
          const def = getAgentDef(a.agentId);
          if (!def) return null;
          const outcome = formatTopOutcome(a.outcomes);
          return (
            <div key={a.agentId} className="flex items-center gap-2.5">
              <MarketplaceAgentIcon agentId={a.agentId} size="sm" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {def.name}
              </span>
              {outcome && (
                <span className="shrink-0 text-xs text-neutral-500 dark:text-neutral-400">
                  {outcome}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Pending approvals or available agents nudge */}
      {pendingCount > 0 ? (
        <p className="mt-3 border-t border-amber-200 pt-2.5 text-xs font-medium text-amber-700 dark:border-amber-800/40 dark:text-amber-400">
          {pendingCount} action{pendingCount !== 1 ? 's' : ''} waiting for approval
        </p>
      ) : availableCount > 0 ? (
        <p className="mt-3 border-t border-dashed border-neutral-200 pt-2.5 text-xs text-neutral-400 dark:border-neutral-800 dark:text-neutral-500">
          {availableCount} more agent{availableCount !== 1 ? 's' : ''} available
        </p>
      ) : null}

      <span className="mt-auto pt-3 text-xs text-neutral-400 dark:text-neutral-500">
        Manage agents
      </span>
    </Link>
  );
}
