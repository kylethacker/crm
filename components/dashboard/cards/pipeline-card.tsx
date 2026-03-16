import { DashboardCard } from '../dashboard-card';
import { cn } from '@/lib/utils';
import { Stat } from '@/components/ui/stat';
import type { PipelineStats, PipelineItem } from '@/lib/dashboard/types';
import { findConversationByName } from '@/lib/messages/mock-data';
import { buildContactContext } from '@/lib/messages/use-start-contact-chat';

type PipelineCardProps = {
  stats: PipelineStats;
  insight?: string;
};

const statusDot: Record<PipelineItem['status'], string> = {
  identified: 'bg-neutral-300 dark:bg-neutral-600',
  contacted: 'bg-neutral-500',
  converted: 'bg-neutral-900 dark:bg-neutral-100',
  'no-response': 'bg-neutral-400',
};

const statusLabel: Record<PipelineItem['status'], string> = {
  identified: 'Identified',
  contacted: 'Contacted',
  converted: 'Won back',
  'no-response': 'No response',
};

export function PipelineCard({ stats, insight }: PipelineCardProps) {
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
      subtitle={`${stats.dormantCount} dormant · ${stats.convertedCount} won`}
      chatContext={{ sourceId: 'pipeline', cardType: 'win-back', title: 'Win-Back Pipeline', summary }}
      chatContactContext={contactCtx}
    >
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <Stat value={stats.dormantCount} label="Dormant" />
          <Stat value={stats.contactedCount} label="Contacted" />
          <Stat value={stats.convertedCount} label="Won back" />
        </div>

        <div className="flex flex-col">
          {stats.items.slice(0, 5).map((item) => (
            <div
              key={item.client}
              className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            >
              <span className={cn('inline-block size-1.5 shrink-0 rounded-full', statusDot[item.status])} />
              <span className="min-w-0 flex-1 truncate text-xs text-neutral-600 dark:text-neutral-400">
                {item.client}
              </span>
              <span className="shrink-0 text-xs text-neutral-400">
                {statusLabel[item.status]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}

