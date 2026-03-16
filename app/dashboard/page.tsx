import { connection } from 'next/server';
import { getCrmStats, getAgentActivityStats, getReviewStats, getPipelineStats, getWebsiteAnalyticsStats } from '@/lib/dashboard/stats';
import { getDashboardInsights } from '@/lib/dashboard/insights';
import { getDailyBriefing } from '@/lib/dashboard/briefing';
import { DashboardGrid } from '@/components/dashboard/dashboard-grid';

export const metadata = {
  title: 'Dashboard',
};

export default async function DashboardPage() {
  await connection();
  const crmStats = getCrmStats();
  const activityStats = getAgentActivityStats();
  const reviewStats = getReviewStats();
  const pipelineStats = getPipelineStats();
  const websiteAnalyticsStats = getWebsiteAnalyticsStats();
  const insightsPromise = getDashboardInsights(crmStats, activityStats);
  const briefing = getDailyBriefing();

  return (
    <DashboardGrid
      crmStats={crmStats}
      activityStats={activityStats}
      reviewStats={reviewStats}
      pipelineStats={pipelineStats}
      websiteAnalyticsStats={websiteAnalyticsStats}
      insightsPromise={insightsPromise}
      briefing={briefing}
    />
  );
}
