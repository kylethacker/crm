'use client';

import { Suspense, use, useMemo, useState } from 'react';
import type { CrmStats, AgentActivityStats, ReviewStats, PipelineStats, WebsiteAnalyticsStats, DashboardInsights } from '@/lib/dashboard/types';
import type { DailyBriefing } from '@/lib/dashboard/briefing';

import { ContactsCard } from './cards/contacts-card';
import { RevenueCard } from './cards/revenue-card';
import { BookingsCard } from './cards/bookings-card';
import { MessagesCard } from './cards/messages-card';
import { ActionRequiredCard } from './cards/action-required-card';
import { ReviewPulseCard } from './cards/review-pulse-card';
import { PipelineCard } from './cards/pipeline-card';
import { WebsiteAnalyticsCard } from './cards/website-analytics-card';
import { ActivitySidebar } from './activity-sidebar';
import { DashboardChat } from './review-panel';
import { DailyBriefingPanel } from './daily-briefing';
import type { AgentActivity } from '@/lib/activity/types';
import { useRouter } from 'next/navigation';
import { useChatHistory } from '@/lib/chat/chat-history-context';

const STATIC_CARD_IDS = [
  'contacts',
  'revenue',
  'bookings',
  'messages',
  'reviews',
  'pipeline',
  'website-analytics',
] as const;

type DashboardGridProps = {
  crmStats: CrmStats;
  activityStats: AgentActivityStats;
  reviewStats: ReviewStats;
  pipelineStats: PipelineStats;
  websiteAnalyticsStats: WebsiteAnalyticsStats;
  insightsPromise: Promise<DashboardInsights | null>;
  briefing: DailyBriefing;
};

function ResolvedInsights({ insightsPromise, children }: { insightsPromise: Promise<DashboardInsights | null>; children: (insights: DashboardInsights | null) => React.ReactNode }) {
  return children(use(insightsPromise));
}

export function DashboardGrid({ crmStats, activityStats, reviewStats, pipelineStats, websiteAnalyticsStats, insightsPromise, briefing }: DashboardGridProps) {
  const [reviewingItem, setReviewingItem] = useState<AgentActivity | null>(null);
  const router = useRouter();
  const { createSession } = useChatHistory();
  const actionItems = activityStats.needsAttention;
  const dynamicActionIds = useMemo(() => actionItems.map((a) => `action-${a.id}`), [actionItems]);
  const allCardIds = useMemo(() => [...dynamicActionIds, ...STATIC_CARD_IDS], [dynamicActionIds]);
  const visibleIds = useMemo(() => new Set(allCardIds), [allCardIds]);

  const handleBriefingAction = (prompt: string) => {
    createSession({ initialMessage: prompt });
    router.push('/chat');
  };

  function renderContent(insights: DashboardInsights | null) {
    const insightMap = insights
      ? new Map(insights.cards.map((c) => [c.cardId, c.reason]))
      : null;
    const getInsight = (cardId: string) => insightMap?.get(cardId);

    return (
      <>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto">
            <DailyBriefingPanel briefing={briefing} onAction={handleBriefingAction} />

            <div className="mx-auto grid max-w-[960px] grid-cols-1 gap-3 px-4 pb-64 sm:grid-cols-2">
              {actionItems.map((item) => {
                const cardId = `action-${item.id}`;
                return visibleIds.has(cardId) ? (
                  <ActionRequiredCard key={cardId} item={item} onReview={setReviewingItem} />
                ) : null;
              })}
              {visibleIds.has('reviews') && (
                <ReviewPulseCard
                  stats={reviewStats}
                  insight={getInsight('reviews')}
                />
              )}
              {visibleIds.has('pipeline') && (
                <PipelineCard
                  stats={pipelineStats}
                  insight={getInsight('pipeline')}
                />
              )}
              {visibleIds.has('revenue') && (
                <RevenueCard
                  totalRevenue={crmStats.totalRevenue}
                  payments={crmStats.revenuePayments}
                  insight={getInsight('revenue')}
                />
              )}
              {visibleIds.has('bookings') && (
                <BookingsCard
                  upcomingBookings={crmStats.upcomingBookings}
                  insight={getInsight('bookings')}
                />
              )}
              {visibleIds.has('contacts') && (
                <ContactsCard
                  total={crmStats.totalContacts}
                  byStatus={crmStats.contactsByStatus}
                  insight={getInsight('contacts')}
                />
              )}
              {visibleIds.has('messages') && (
                <MessagesCard
                  total={crmStats.totalMessages}
                  inbound={crmStats.inboundMessages}
                  outbound={crmStats.outboundMessages}
                  insight={getInsight('messages')}
                />
              )}
              {visibleIds.has('website-analytics') && (
                <WebsiteAnalyticsCard
                  stats={websiteAnalyticsStats}
                  insight={getInsight('website-analytics')}
                />
              )}
            </div>
          </div>
        </div>

        <ActivitySidebar
          activities={activityStats.recentActivity}
          totalCount={activityStats.totalActivities}
          insight={getInsight('agent-activity')}
        />
      </>
    );
  }

  return (
    <div className="flex h-full">
      <Suspense fallback={renderContent(null)}>
        <ResolvedInsights insightsPromise={insightsPromise}>
          {renderContent}
        </ResolvedInsights>
      </Suspense>

      <DashboardChat
        reviewItem={reviewingItem}
        onClearReview={() => setReviewingItem(null)}
      />
    </div>
  );
}
