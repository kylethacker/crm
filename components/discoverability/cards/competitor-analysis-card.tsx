import type { CompetitorAnalysis } from '@/lib/discoverability/types';
import { cn } from '@/lib/utils';

type CompetitorAnalysisCardProps = {
  analysis: CompetitorAnalysis;
};

const trendIcon: Record<string, string> = {
  up: '↑',
  down: '↓',
  flat: '→',
};

const trendColor: Record<string, string> = {
  up: 'text-green-600 dark:text-green-400',
  down: 'text-red-600 dark:text-red-400',
  flat: 'text-neutral-400 dark:text-neutral-500',
};

export function CompetitorAnalysisCard({ analysis }: CompetitorAnalysisCardProps) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-neutral-200/70 bg-app-surface px-5 py-4 dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
        Competitor Analysis
      </h3>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-4xl font-bold text-neutral-900 dark:text-neutral-100">
          #{analysis.rank}
        </span>
        <span className="text-sm text-neutral-400 dark:text-neutral-500">
          of {analysis.totalCompetitors + 1} businesses
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        {/* Your position */}
        <div className="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-1.5 dark:bg-blue-900/20">
          <span className="w-5 text-center text-xs font-bold text-blue-600 dark:text-blue-400">
            {analysis.rank}
          </span>
          <span className="flex-1 truncate text-sm font-medium text-blue-700 dark:text-blue-300">
            You
          </span>
          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
            {analysis.yourScore}
          </span>
        </div>

        {/* Competitors */}
        {analysis.competitors.map((comp, i) => {
          const rank = i < analysis.rank - 1 ? i + 1 : i + 2;
          return (
            <div key={comp.name} className="flex items-center gap-2 px-3 py-1.5">
              <span className="w-5 text-center text-xs font-medium text-neutral-400 dark:text-neutral-500">
                {rank}
              </span>
              <span className="flex-1 truncate text-sm text-neutral-700 dark:text-neutral-300">
                {comp.name}
              </span>
              <span className={cn('mr-1 text-[10px]', trendColor[comp.trend])}>
                {trendIcon[comp.trend]}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {comp.score}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
