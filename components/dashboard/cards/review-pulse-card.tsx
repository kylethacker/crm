import { DashboardCard } from '../dashboard-card';
import type { ReviewStats } from '@/lib/dashboard/types';
import { findConversationByName } from '@/lib/messages/mock-data';
import { buildContactContext } from '@/lib/messages/use-start-contact-chat';

type ReviewPulseCardProps = {
  stats: ReviewStats;
  insight?: string;
};

export function ReviewPulseCard({ stats }: ReviewPulseCardProps) {
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
      description={`${stats.totalCollected} collected · ${stats.pendingRequests} pending`}
      value={`${stats.averageRating}/5`}
      cta="View reviews"
      chatContext={{ sourceId: 'reviews', cardType: 'reviews', title: 'Reviews', summary }}
      chatContactContext={contactCtx}
    />
  );
}
