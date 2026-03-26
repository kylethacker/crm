'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveAgents } from '@/lib/marketplace/active-agents-context';
import { MarketplaceAgentIcon } from '@/components/marketplace/agent-icon';
import {
  autonomyLabel,
  autonomyColor,
} from '@/lib/marketplace/format';
import type { AutonomyLevel } from '@/lib/marketplace/types';

type HireAgentOutput = {
  success: true;
  agentId: string;
  name: string;
  role: string;
  price: number;
  defaultAutonomy: AutonomyLevel;
  expectedOutcome: string | null;
  highlights: string[];
  triggers: { type: string; description: string }[];
  settings: { key: string; label: string; value: string | number | boolean }[];
};

type HireAgentError = {
  success: false;
  error: string;
};

type HireAgentData = HireAgentOutput | HireAgentError;

export function HireAgentResult({ data }: { data: HireAgentData }) {
  if (!data.success) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
        {data.error}
      </div>
    );
  }

  return <HireAgentCard data={data} />;
}

function HireAgentCard({ data }: { data: HireAgentOutput }) {
  const router = useRouter();
  const { activateAgent, getAgent } = useActiveAgents();
  const activatedRef = useRef(false);

  useEffect(() => {
    if (activatedRef.current) return;
    if (getAgent(data.agentId)) return;
    activatedRef.current = true;
    activateAgent(data.agentId, data.defaultAutonomy);
  }, [data.agentId, data.defaultAutonomy, activateAgent, getAgent]);

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
          <MarketplaceAgentIcon agentId={data.agentId} size="md" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {data.name}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {data.role}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${autonomyColor[data.defaultAutonomy]}`}
        >
          {autonomyLabel[data.defaultAutonomy]}
        </span>
      </div>

      {/* Settings */}
      {data.settings.length > 0 && (
        <div className="border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
          <div className="space-y-1.5">
            {data.settings.map((s) => (
              <div key={s.key} className="flex items-center justify-between text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">
                  {s.label}
                </span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {typeof s.value === 'boolean'
                    ? s.value
                      ? 'Yes'
                      : 'No'
                    : String(s.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expected outcome */}
      {data.expectedOutcome && (
        <div className="border-b border-neutral-100 px-4 py-2.5 dark:border-neutral-800">
          <p className="text-xs font-medium text-green-700 dark:text-green-400">
            {data.expectedOutcome}
          </p>
        </div>
      )}

      {/* CTA */}
      <div className="px-4 py-3">
        <button
          type="button"
          onClick={() => router.push(`/team/${data.agentId}?onboard=1`)}
          className="w-full rounded-lg bg-neutral-900 px-3 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
        >
          Go to {data.name}
        </button>
      </div>
    </div>
  );
}
