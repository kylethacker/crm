import { DashboardCard } from '../dashboard-card';
import { Stat } from '@/components/ui/stat';
import type { ReviewStats } from '@/lib/dashboard/types';
import { findConversationByName } from '@/lib/messages/mock-data';
import { buildContactContext } from '@/lib/messages/use-start-contact-chat';

type ReviewPulseCardProps = {
  stats: ReviewStats;
  insight?: string;
};

export function ReviewPulseCard({ stats, insight }: ReviewPulseCardProps) {
  const clientNames = [...new Set(stats.recentReviews.map((r) => r.client))];
  const firstConvo = clientNames.length > 0 ? findConversationByName(clientNames[0]!) : undefined;
  const contactCtx = firstConvo ? buildContactContext(firstConvo) : undefined;

  const summary = [
    `Average rating: ${stats.averageRating}/5`,
    `Total collected: ${stats.totalCollected}`,
    `Pending review requests: ${stats.pendingRequests}`,
    `Flagged reviews: ${stats.flaggedCount}`,
    '',
    'Recent reviews:',
    ...stats.recentReviews.map((r) => `- ${r.client}: ${r.rating}/5`),
  ].join('\n');

  return (
    <DashboardCard
      title="Reviews"
      subtitle={`${stats.totalCollected} collected · ${stats.averageRating} avg`}
      chatContext={{ sourceId: 'reviews', cardType: 'reviews', title: 'Reviews', summary }}
      chatContactContext={contactCtx}
    >
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Stat value={stats.averageRating} label="Avg" />
          <Stat value={stats.pendingRequests} label="Pending" />
          {stats.flaggedCount > 0 && <Stat value={stats.flaggedCount} label="Flagged" />}
        </div>

        <div className="flex flex-col">
          {stats.recentReviews.slice(0, 4).map((review) => (
            <div
              key={review.client}
              className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-white text-xs font-bold text-neutral-500 shadow-[0_1px_4px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)] dark:bg-neutral-800 dark:text-neutral-400 dark:shadow-[0_1px_4px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.05)]">
                {review.rating}
              </span>
              <span className="min-w-0 flex-1 truncate text-xs text-neutral-600 dark:text-neutral-400">
                {review.client}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}

