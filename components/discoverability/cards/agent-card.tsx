'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AgentDefinition } from '@/lib/marketplace/types';
import type { PromptRankingData } from '@/lib/discoverability/types';
import { useActiveAgents } from '@/lib/marketplace/active-agents-context';
import { MarketplaceAgentIcon } from '@/components/marketplace/agent-icon';
import { formatOutcomeValue } from '@/lib/marketplace/format';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogPortal,
  DialogBackdrop,
  DialogPopup,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  autonomyLabel,
  autonomyDescription,
  autonomyColor,
} from '@/lib/marketplace/format';

type DiscoverabilityAgentCardProps = {
  agent: AgentDefinition;
  promptRankings?: PromptRankingData;
};

export function DiscoverabilityAgentCard({ agent, promptRankings }: DiscoverabilityAgentCardProps) {
  const router = useRouter();
  const { agents: activeAgentList, activateAgent } = useActiveAgents();
  const [dialogOpen, setDialogOpen] = useState(false);
  const agentRef = useRef(agent);
  agentRef.current = agent;

  const activeAgent = activeAgentList.find((a) => a.agentId === agent.id);
  const isActive = !!activeAgent;

  if (isActive) {
    const outcomes = Object.entries(activeAgent.outcomes);
    return (
      <button
        type="button"
        onClick={() => router.push(`/team/${agent.id}`)}
        className="flex h-full cursor-pointer flex-col rounded-lg border border-neutral-200/70 bg-app-surface px-5 py-4 text-left transition-colors hover:bg-neutral-50/80 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/70"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
            <MarketplaceAgentIcon agentId={agent.id} size="md" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{agent.name}</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{agent.role}</p>
          </div>
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
            Active
          </span>
        </div>

        {/* Outcomes */}
        {outcomes.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {outcomes.map(([key, value]) => (
              <div key={key} className="text-xs">
                <span className="font-medium text-neutral-700 dark:text-neutral-300">{formatOutcomeValue(key, value)}</span>
                <span className="ml-1 text-neutral-400 dark:text-neutral-500">{key}</span>
              </div>
            ))}
          </div>
        )}

        {/* Prompt rankings inline preview */}
        {promptRankings && (
          <div className="mt-3 flex gap-4 border-t border-neutral-100 pt-3 dark:border-neutral-800">
            <div className="text-xs">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">#{promptRankings.averagePosition.toFixed(1)}</span>
              <span className="ml-1 text-neutral-400 dark:text-neutral-500">avg position</span>
            </div>
            <div className="text-xs">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">{promptRankings.mentionRate}%</span>
              <span className="ml-1 text-neutral-400 dark:text-neutral-500">mention rate</span>
            </div>
          </div>
        )}

        <span className="mt-auto pt-3 text-xs text-neutral-400 dark:text-neutral-500">
          View agent →
        </span>
      </button>
    );
  }

  // Not hired — show "add" card
  return (
    <>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        className="group flex h-full cursor-pointer flex-col rounded-lg border border-dashed border-neutral-300 bg-app-surface px-5 py-4 text-left transition-colors hover:border-neutral-400 hover:bg-neutral-50/80 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-neutral-600 dark:hover:bg-neutral-800/70"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
            <MarketplaceAgentIcon agentId={agent.id} size="md" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{agent.name}</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{agent.role}</p>
          </div>
          <span className="text-xs font-medium text-neutral-400 dark:text-neutral-500">
            {agent.price === 0 ? 'Free' : `$${agent.price}/mo`}
          </span>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
          &ldquo;{agent.problem}&rdquo;
        </p>

        {agent.expectedOutcome && (
          <p className="mt-1.5 text-xs font-medium text-green-700 dark:text-green-400">
            {agent.expectedOutcome}
          </p>
        )}

        <span className="mt-auto pt-3 text-xs font-medium text-blue-600 transition-colors group-hover:text-blue-700 dark:text-blue-400 dark:group-hover:text-blue-300">
          + Add agent
        </span>
      </button>

      <AgentHireDialog
        open={dialogOpen}
        agent={agentRef.current}
        onClose={() => setDialogOpen(false)}
        onHire={(def) => {
          activateAgent(def.id, def.defaultAutonomy);
          setDialogOpen(false);
          router.push(`/team/${def.id}?onboard=1`);
        }}
      />
    </>
  );
}

// ── Hire dialog ──────────────────────────────────────────────────────────────

function AgentHireDialog({
  open,
  agent,
  onClose,
  onHire,
}: {
  open: boolean;
  agent: AgentDefinition;
  onClose: () => void;
  onHire: (agent: AgentDefinition) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup className="flex max-w-lg flex-col gap-0 p-0">
          <div className="flex items-center gap-4 border-b border-neutral-100 px-6 pt-6 pb-5 dark:border-neutral-800">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
              <MarketplaceAgentIcon agentId={agent.id} size="xl" />
            </span>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg">{agent.name}</DialogTitle>
              <DialogDescription>{agent.role}</DialogDescription>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                {agent.price === 0 ? 'Free' : `$${agent.price}`}
              </p>
              {agent.price > 0 && (
                <p className="text-xs text-neutral-400 dark:text-neutral-500">per month</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-5 px-6 py-5">
            <div className="rounded-lg bg-neutral-50 px-4 py-3 dark:bg-neutral-800/50">
              <p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300">
                &ldquo;{agent.problem}&rdquo;
              </p>
              {agent.expectedOutcome && (
                <p className="mt-1.5 text-xs font-medium text-green-700 dark:text-green-400">
                  {agent.expectedOutcome}
                </p>
              )}
            </div>

            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {agent.does}
            </p>

            {agent.highlights && agent.highlights.length > 0 && (
              <ul className="flex flex-col gap-2">
                {agent.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-2.5">
                    <svg className="mt-0.5 size-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">{h}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="rounded-lg border border-neutral-100 px-4 py-3 dark:border-neutral-800">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                How it runs
              </p>
              <div className="mt-2 flex flex-col gap-1.5">
                {agent.triggers.map((t) => (
                  <div key={t.description} className="flex items-center gap-2">
                    <span className="size-1 shrink-0 rounded-full bg-neutral-300 dark:bg-neutral-600" />
                    <span className="text-sm text-neutral-600 dark:text-neutral-400">{t.description}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <span className={cn('size-1 shrink-0 rounded-full', agent.defaultAutonomy === 'auto' ? 'bg-green-400' : 'bg-blue-400')} />
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {autonomyDescription[agent.defaultAutonomy]}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-100 px-6 py-4 dark:border-neutral-800">
            <Button className="w-full" size="lg" onClick={() => onHire(agent)}>
              {agent.price === 0 ? `Add ${agent.name}` : `Hire ${agent.name} — $${agent.price}/mo`}
            </Button>
            <DialogClose className="mt-2.5 block w-full cursor-pointer text-center text-xs text-neutral-400 transition-colors hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300">
              Not now
            </DialogClose>
          </div>
        </DialogPopup>
      </DialogPortal>
    </Dialog>
  );
}
