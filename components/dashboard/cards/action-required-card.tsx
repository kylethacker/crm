import type { AgentActivity } from '@/lib/activity/types';
import { buildQueuePrompt } from '@/lib/chat/queue-prompt';
import { PromptCard } from '../prompt-card';

type ActionRequiredGroupCardProps = {
  items: AgentActivity[];
};

export function ActionRequiredGroupCard({ items }: ActionRequiredGroupCardProps) {
  if (items.length === 0) return null;

  const failedCount = items.filter((i) => i.status === 'failed').length;
  const approvalCount = items.length - failedCount;

  const prompt = buildQueuePrompt({
    header: `I have ${items.length} agent action${items.length !== 1 ? 's' : ''} to review:`,
    items: items.map((item) => {
      const parts = [`[${item.status === 'failed' ? 'FAILED' : 'NEEDS APPROVAL'}] ${item.description}`];
      if (item.detail) parts.push(item.detail);
      if (item.preview) {
        for (const block of item.preview) {
          parts.push(`${block.label}: ${block.value}`);
        }
      }
      return { label: parts[0]!, detail: parts.slice(1).join(' · ') || undefined };
    }),
    steps: [
      'Walk me through these one at a time. For each action:',
      '1. Show me what the agent did and why',
      '2. Give me your recommendation (approve, dismiss, or retry)',
      '3. Stop and wait for my response before moving to the next one',
    ],
  });

  const cta = [
    approvalCount > 0 && `${approvalCount} to approve`,
    failedCount > 0 && `${failedCount} failed`,
  ].filter(Boolean).join(' · ') + ' · Review all';

  return (
    <PromptCard
      title="Agent Actions"
      labels={items.map((i) => i.description)}
      cta={cta}
      prompt={prompt}
    />
  );
}
