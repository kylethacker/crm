import { DashboardCard } from '../dashboard-card';

type MessagesCardProps = {
  total: number;
  inbound: number;
  outbound: number;
  insight?: string;
};

export function MessagesCard({ total, inbound, outbound }: MessagesCardProps) {
  const inPct = total > 0 ? Math.round((inbound / total) * 100) : 0;
  const outPct = total > 0 ? 100 - inPct : 0;

  const summary = [
    `${total} total messages`,
    `- Inbound: ${inbound} (${inPct}%)`,
    `- Outbound: ${outbound} (${outPct}%)`,
  ].join('\n');

  return (
    <DashboardCard
      title="Messages"
      description={`${inbound} inbound · ${outbound} outbound`}
      value={String(total)}
      cta="View messages"
      chatContext={{ sourceId: 'messages', cardType: 'messages', title: 'Messages', summary }}
    />
  );
}
