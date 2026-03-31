import type { BusinessPulseStats } from '@/lib/dashboard/types';

type BusinessPulseProps = {
  stats: BusinessPulseStats;
};

export function BusinessPulse({ stats }: BusinessPulseProps) {
  const leadsDiff = stats.leads.thisWeek - stats.leads.lastWeek;
  const leadsDirection = leadsDiff > 0 ? 'up' : leadsDiff < 0 ? 'down' : 'same';

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Leads */}
      <button
        type="button"
        className="flex flex-col rounded-lg border border-neutral-200 bg-white px-3 py-3 text-left transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/70"
      >
        <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Leads
        </span>
        <span className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {stats.leads.thisWeek}
        </span>
        <span className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
          this week{' '}
          <span className={leadsDirection === 'up' ? 'text-green-600 dark:text-green-400' : leadsDirection === 'down' ? 'text-red-600 dark:text-red-400' : ''}>
            ({leadsDirection === 'up' ? '+' : ''}{leadsDiff} vs last)
          </span>
        </span>
      </button>

      {/* Revenue */}
      <button
        type="button"
        className="flex flex-col rounded-lg border border-neutral-200 bg-white px-3 py-3 text-left transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/70"
      >
        <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Revenue
        </span>
        <span className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          ${stats.revenue.thisMonth.toLocaleString()}
        </span>
        <span className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
          this month{' '}
          {stats.revenue.outstanding > 0 && (
            <span className="text-amber-600 dark:text-amber-400">
              (${stats.revenue.outstanding.toLocaleString()} due)
            </span>
          )}
        </span>
      </button>

      {/* Reputation */}
      <button
        type="button"
        className="flex flex-col rounded-lg border border-neutral-200 bg-white px-3 py-3 text-left transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/70"
      >
        <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          Reputation
        </span>
        <span className="mt-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {stats.reputation.rating} <span className="text-sm font-normal text-amber-500">&#9733;</span>
        </span>
        <span className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
          {stats.reputation.newReviewsThisWeek} new review{stats.reputation.newReviewsThisWeek !== 1 ? 's' : ''} this week
        </span>
      </button>
    </div>
  );
}
