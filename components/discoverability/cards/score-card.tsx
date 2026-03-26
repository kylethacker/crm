import type { DiscoverabilityScore } from '@/lib/discoverability/types';
import { cn } from '@/lib/utils';

type ScoreCardProps = {
  score: DiscoverabilityScore;
};

function scoreColor(score: number) {
  if (score >= 75) return 'text-green-600 dark:text-green-400';
  if (score >= 50) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function barColor(score: number) {
  if (score >= 75) return 'bg-green-500 dark:bg-green-400';
  if (score >= 50) return 'bg-amber-500 dark:bg-amber-400';
  return 'bg-red-500 dark:bg-red-400';
}

const trendIcon: Record<string, string> = {
  up: '↑',
  down: '↓',
  flat: '→',
};

export function ScoreCard({ score }: ScoreCardProps) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-neutral-200/70 bg-app-surface px-5 py-4 dark:border-neutral-800 dark:bg-neutral-900">
      <h3 className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
        Discoverability Score
      </h3>

      <div className="mt-3 flex items-baseline gap-2">
        <span className={cn('text-4xl font-bold', scoreColor(score.overall))}>
          {score.overall}
        </span>
        <span className="text-sm text-neutral-400 dark:text-neutral-500">/ {score.maxScore}</span>
        <span className={cn(
          'ml-auto flex items-center gap-0.5 text-xs font-medium',
          score.trend === 'up' ? 'text-green-600 dark:text-green-400' : score.trend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-neutral-400',
        )}>
          {trendIcon[score.trend]} {score.trendDelta} pts
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        {score.categories.map((cat) => (
          <div key={cat.label}>
            <div className="flex items-center justify-between text-xs">
              <span className="text-neutral-600 dark:text-neutral-400">{cat.label}</span>
              <span className="font-medium text-neutral-700 dark:text-neutral-300">{cat.score}</span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
              <div
                className={cn('h-full rounded-full transition-all', barColor(cat.score))}
                style={{ width: `${(cat.score / cat.maxScore) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
