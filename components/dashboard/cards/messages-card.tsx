import { DashboardCard } from '../dashboard-card';

type MessagesCardProps = {
  total: number;
  inbound: number;
  outbound: number;
  insight?: string;
};

export function MessagesCard({ total, inbound, outbound, insight }: MessagesCardProps) {
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
      subtitle={`${total} total`}
      chatContext={{ sourceId: 'messages', cardType: 'messages', title: 'Messages', summary }}
    >
      <div className="flex flex-col gap-2.5">
        <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{total}</p>
        <div className="flex flex-col gap-1.5">
          <Bar label="Inbound" value={inbound} pct={inPct} dark />
          <Bar label="Outbound" value={outbound} pct={outPct} />
        </div>
      </div>
    </DashboardCard>
  );
}

function Bar({ label, value, pct, dark }: { label: string; value: number; pct: number; dark?: boolean }) {
  return (
    <div>
      <div className="mb-0.5 flex items-center justify-between">
        <span className="text-xs text-neutral-500 dark:text-neutral-400">{label}</span>
        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-200">
          {value} <span className="font-normal text-neutral-400">({pct}%)</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <div
          className={dark
            ? 'h-full rounded-full bg-neutral-900 dark:bg-neutral-100'
            : 'h-full rounded-full bg-neutral-400 dark:bg-neutral-600'}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
