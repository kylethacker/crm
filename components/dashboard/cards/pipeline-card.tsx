import { DashboardCard } from '../dashboard-card';
import type { PipelineStats, PipelineItem } from '@/lib/dashboard/types';
import { findConversationByName } from '@/lib/messages/mock-data';
import { buildContactContext } from '@/lib/messages/use-start-contact-chat';

type PipelineCardProps = {
  stats: PipelineStats;
  insight?: string;
};

const statusLabel: Record<PipelineItem['status'], string> = {
  identified: 'Identified',
  contacted: 'Contacted',
  converted: 'Won back',
  'no-response': 'No response',
};

export function PipelineCard({ stats }: PipelineCardProps) {
  const clientNames = [...new Set(stats.items.map((i) => i.client))];
  const firstConvo = clientNames.length > 0 ? findConversationByName(clientNames[0]!) : undefined;
  const contactCtx = firstConvo ? buildContactContext(firstConvo) : undefined;

  const summary = [
    `Dormant clients: ${stats.dormantCount}`,
    `Contacted: ${stats.contactedCount}`,
    `Won back: ${stats.convertedCount}`,
    '',
    'Clients:',
    ...stats.items.map((i) => `- ${i.client}: ${statusLabel[i.status]}`),
  ].join('\n');

  return (
    <DashboardCard
      title="Win-Back"
      description={`${stats.dormantCount} dormant · ${stats.convertedCount} won back`}
      value={String(stats.dormantCount)}
      cta="View pipeline"
      chatContext={{ sourceId: 'pipeline', cardType: 'win-back', title: 'Win-Back Pipeline', summary }}
      chatContactContext={contactCtx}
    />
  );
}
