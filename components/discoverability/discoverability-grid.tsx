'use client';

import type { DiscoverabilityScore, CompetitorAnalysis, PromptRankingData } from '@/lib/discoverability/types';
import { discoverabilityAgents } from '@/lib/marketplace/data';
import { ScoreCard } from './cards/score-card';
import { CompetitorAnalysisCard } from './cards/competitor-analysis-card';
import { DiscoverabilityAgentCard } from './cards/agent-card';

type DiscoverabilityGridProps = {
  score: DiscoverabilityScore;
  competitors: CompetitorAnalysis;
  promptRankings: PromptRankingData;
};

export function DiscoverabilityGrid({ score, competitors, promptRankings }: DiscoverabilityGridProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto grid max-w-[960px] grid-cols-1 gap-4 px-5 pt-8 pb-64 sm:grid-cols-2">
        {/* Page header */}
        <div className="col-span-full">
          <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
            Discoverability
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            How easily customers find you online — and what you can do about it.
          </p>
        </div>

        {/* Always-visible cards */}
        <ScoreCard score={score} />
        <CompetitorAnalysisCard analysis={competitors} />

        {/* Discoverability agents */}
        <div className="col-span-full mt-4 mb-1">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Agents
          </h2>
          <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
            Add agents to improve how customers find you.
          </p>
        </div>

        {discoverabilityAgents.map((def) => (
          <DiscoverabilityAgentCard key={def.id} agent={def} promptRankings={def.id === 'prompt-rankings' ? promptRankings : undefined} />
        ))}
      </div>
    </div>
  );
}
