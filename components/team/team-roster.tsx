'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AgentDefinition, ActiveAgent } from '@/lib/marketplace/types';
import { agentDefinitions, buildHirePrompt } from '@/lib/marketplace/data';
import { useActiveAgents } from '@/lib/marketplace/active-agents-context';
import { MarketplaceAgentIcon } from '@/components/marketplace/agent-icon';
import { useChatHistory } from '@/lib/chat/chat-history-context';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  autonomyLabel,
  autonomyDescription,
  autonomyColor,
} from '@/lib/marketplace/format';
import {
  Dialog,
  DialogPortal,
  DialogBackdrop,
  DialogPopup,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';

// ── Component ────────────────────────────────────────────────────────────────

export function TeamRoster() {
  const router = useRouter();
  const { createSession } = useChatHistory();
  const { agents: activeAgentList, activateAgent } = useActiveAgents();
  const [dialogOpen, setDialogOpen] = useState(false);
  // Keep a ref to the last-selected agent so content persists through the close animation
  const lastAgentRef = useRef<AgentDefinition | null>(null);

  // Derive hired / available from the context so changes are reactive
  const { hired, available, pendingCount } = useMemo(() => {
    const activeIds = new Set(activeAgentList.map((a) => a.agentId));
    const hiredList: Array<{ active: ActiveAgent; def: AgentDefinition }> = [];
    const availableList: AgentDefinition[] = [];
    for (const def of agentDefinitions) {
      const active = activeAgentList.find((a) => a.agentId === def.id);
      if (active) {
        hiredList.push({ active, def });
      } else {
        availableList.push(def);
      }
    }
    const pending = activeAgentList.flatMap((a) =>
      a.recentActions.filter((act) => act.status === 'proposed'),
    ).length;
    return { hired: hiredList, available: availableList, pendingCount: pending };
  }, [activeAgentList]);

  const openAgentDialog = (def: AgentDefinition) => {
    lastAgentRef.current = def;
    setDialogOpen(true);
  };
  const closeAgentDialog = () => setDialogOpen(false);

  const openChat = (message: string) => {
    createSession({ initialMessage: message });
    router.push('/chat');
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto grid max-w-[960px] grid-cols-1 gap-3 px-4 pt-8 pb-64 sm:grid-cols-2">

        {/* ── Page header — spans full width ── */}
        <div className="col-span-full flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              Your Agents
            </h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              {hired.length > 0
                ? `${hired.length} agent${hired.length !== 1 ? 's' : ''} working for you`
                : 'Hire agents to handle work while you focus on what matters'}
            </p>
          </div>
        </div>

        {/* ── Pending approvals — spans full width ── */}
        {pendingCount > 0 && (
          <button
            type="button"
            onClick={() => openChat(`Show me the ${pendingCount} action${pendingCount !== 1 ? 's' : ''} waiting for my approval. Walk me through each one.`)}
            className="col-span-full flex w-full cursor-pointer items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left transition-colors hover:bg-amber-100 dark:border-amber-800/40 dark:bg-amber-900/20 dark:hover:bg-amber-900/30"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-200 text-sm font-semibold dark:bg-amber-800">
              {pendingCount}
            </span>
            <div>
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                {pendingCount} action{pendingCount !== 1 ? 's' : ''} waiting for your approval
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Tap to review
              </p>
            </div>
          </button>
        )}

        {/* ── Active agents — grid cards ── */}
        {hired.map(({ active: a, def }) => (
            <button
              key={def.id}
              type="button"
              onClick={() => router.push(`/team/${def.id}`)}
              className="flex h-full cursor-pointer flex-col rounded-2xl bg-black/3 p-5 text-left transition-colors hover:bg-black/5 dark:bg-white/4 dark:hover:bg-white/6"
            >
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:bg-neutral-800 dark:shadow-none">
                  <MarketplaceAgentIcon agentId={def.id} size="md" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                      {def.name}
                    </h3>
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', autonomyColor[a.autonomy])}>
                      {autonomyLabel[a.autonomy]}
                    </span>
                    {a.paused && (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500 dark:bg-neutral-800">
                        Paused
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    {def.role}
                  </p>
                </div>
              </div>
            </button>
        ))}

        {/* ── Marketplace header — spans full width ── */}
        {available.length > 0 && (
          <div className="col-span-full mt-8 mb-1">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Add an Agent
            </h2>
            <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
              Each agent solves one problem, completely.
            </p>
          </div>
        )}

        {/* ── Available agents — grid cards ── */}
        {available.map((def) => (
          <button
            key={def.id}
            type="button"
            onClick={() => openAgentDialog(def)}
            className="group flex h-full cursor-pointer flex-col rounded-2xl bg-black/3 p-5 text-left transition-colors hover:bg-black/5 dark:bg-white/4 dark:hover:bg-white/6"
          >
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:bg-neutral-800 dark:shadow-none">
                <MarketplaceAgentIcon agentId={def.id} size="md" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {def.name}
                  </h3>
                  <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', autonomyColor[def.defaultAutonomy])}>
                    {autonomyLabel[def.defaultAutonomy]}
                  </span>
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                  {def.role}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* ── Agent detail dialog ── */}
      <AgentDetailDialog
        open={dialogOpen}
        agent={lastAgentRef.current}
        onClose={closeAgentDialog}
        onHire={(agent) => {
          activateAgent(agent.id, agent.defaultAutonomy);
          closeAgentDialog();
          router.push(`/team/${agent.id}?onboard=1`);
        }}
      />
    </div>
  );
}

// ── Agent detail dialog ──────────────────────────────────────────────────────

function AgentDetailDialog({
  open,
  agent,
  onClose,
  onHire,
}: {
  open: boolean;
  agent: AgentDefinition | null;
  onClose: () => void;
  onHire: (agent: AgentDefinition) => void;
}) {
  if (!agent) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogPortal>
        <DialogBackdrop />
        <DialogPopup className="flex max-w-lg flex-col gap-0 p-0">
            {/* ── Hero ── */}
            <div className="flex items-center gap-4 border-b border-neutral-100 px-6 pt-6 pb-5 dark:border-neutral-800">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                <MarketplaceAgentIcon agentId={agent.id} size="xl" />
              </span>
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-lg">
                  {agent.name}
                </DialogTitle>
                <DialogDescription>
                  {agent.role}
                </DialogDescription>
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

            {/* ── Body ── */}
            <div className="flex flex-col gap-5 px-6 py-5">
              {/* The problem — emotional hook */}
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

              {/* What it does */}
              <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {agent.does}
              </p>

              {/* Highlights — what you get */}
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

              {/* How it runs */}
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

            {/* ── Footer CTA ── */}
            <div className="border-t border-neutral-100 px-6 py-4 dark:border-neutral-800">
              <Button
                className="w-full"
                size="lg"
                onClick={() => onHire(agent)}
              >
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
