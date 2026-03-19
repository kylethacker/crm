'use client';

import type { CrmStats, AgentActivityStats, ReviewStats, PipelineStats, WebsiteAnalyticsStats } from '@/lib/dashboard/types';
import type { DailyBriefing } from '@/lib/dashboard/briefing';

import { ContactsCard } from './cards/contacts-card';
import { RevenueCard } from './cards/revenue-card';
import { BookingsCard } from './cards/bookings-card';
import { MessagesCard } from './cards/messages-card';
import { ActionRequiredGroupCard } from './cards/action-required-card';
import { ReviewPulseCard } from './cards/review-pulse-card';
import { PipelineCard } from './cards/pipeline-card';
import { WebsiteAnalyticsCard } from './cards/website-analytics-card';
import { ActivityCard } from './cards/activity-card';
import { TeamCard } from './cards/team-card';
import { DailyBriefingHeader, BriefingCards } from './daily-briefing';
import { activeAgents, availableAgents, getPendingApprovals } from '@/lib/marketplace/data';

type DashboardGridProps = {
  crmStats: CrmStats;
  activityStats: AgentActivityStats;
  reviewStats: ReviewStats;
  pipelineStats: PipelineStats;
  websiteAnalyticsStats: WebsiteAnalyticsStats;
  briefing: DailyBriefing;
};

export function DashboardGrid({ crmStats, activityStats, reviewStats, pipelineStats, websiteAnalyticsStats, briefing }: DashboardGridProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto grid max-w-[960px] grid-cols-1 gap-3 px-4 pt-8 pb-64 sm:grid-cols-2">
        <DailyBriefingHeader greeting={briefing.greeting} />

        <BriefingCards briefing={briefing} />

        <ActionRequiredGroupCard items={activityStats.needsAttention} />

        <RevenueCard
          totalRevenue={crmStats.totalRevenue}
          payments={crmStats.revenuePayments}
        />
        <BookingsCard upcomingBookings={crmStats.upcomingBookings} />
        <ContactsCard
          total={crmStats.totalContacts}
          byStatus={crmStats.contactsByStatus}
        />
        <MessagesCard
          total={crmStats.totalMessages}
          inbound={crmStats.inboundMessages}
          outbound={crmStats.outboundMessages}
        />
        <ReviewPulseCard stats={reviewStats} />
        <WebsiteAnalyticsCard stats={websiteAnalyticsStats} />
        <PipelineCard stats={pipelineStats} />
        <ActivityCard
          activities={activityStats.recentActivity}
          totalCount={activityStats.totalActivities}
        />
        <TeamCard activeAgents={activeAgents} availableCount={availableAgents.length} pendingCount={getPendingApprovals().length} />
      </div>
    </div>
  );
}
