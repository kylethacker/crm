import { DashboardCard } from '../dashboard-card';
import type { AgentActivity } from '@/lib/activity/types';
import { agentNameMap } from '@/lib/apps/data';

type ActivityCardProps = {
  activities: AgentActivity[];
  totalCount: number;
};

export function ActivityCard({ activities, totalCount }: ActivityCardProps) {
  const summary = [
    `${totalCount} total activities`,
    '',
    'Recent:',
    ...activities.slice(0, 5).map((a) => `- ${a.description} (${agentNameMap.get(a.agentId) ?? a.agentId})`),
  ].join('\n');

  return (
    <DashboardCard
      title="Activity"
      description="Recent agent events"
      value={String(totalCount)}
      cta="View all activity"
      chatContext={{ sourceId: 'agent-activity', cardType: 'agent-activity', title: 'Agent Activity', summary }}
    />
  );
}
