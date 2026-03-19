import { DashboardCard } from '../dashboard-card';
import type { WebsiteAnalyticsStats } from '@/lib/dashboard/types';

type WebsiteAnalyticsCardProps = {
  stats: WebsiteAnalyticsStats;
  insight?: string;
};

export function WebsiteAnalyticsCard({ stats }: WebsiteAnalyticsCardProps) {
  const summary = [
    `Total visitors: ${stats.totalVisitors.toLocaleString()}`,
    `Page views: ${stats.pageViews.toLocaleString()}`,
    `Bounce rate: ${stats.bounceRate}%`,
    `Avg. session duration: ${stats.avgSessionDuration}`,
    '',
    'Traffic Sources:',
    ...stats.trafficSources.map((s) => `- ${s.source}: ${s.visitors.toLocaleString()} visitors (${s.pct}%)`),
  ].join('\n');

  return (
    <DashboardCard
      title="Website"
      description={`${stats.pageViews.toLocaleString()} page views · ${stats.bounceRate}% bounce`}
      value={stats.totalVisitors.toLocaleString()}
      cta="View analytics"
      chatContext={{ sourceId: 'website-analytics', cardType: 'website-analytics', title: 'Website Analytics', summary }}
    />
  );
}
