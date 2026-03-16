import { DashboardCard } from '../dashboard-card';
import type { RevenuePayment } from '@/lib/dashboard/types';
import { findConversationByName } from '@/lib/messages/mock-data';
import { buildContactContext } from '@/lib/messages/use-start-contact-chat';

type RevenueCardProps = {
  totalRevenue: number;
  payments: RevenuePayment[];
  insight?: string;
};

export function RevenueCard({ totalRevenue, payments, insight }: RevenueCardProps) {
  const contactNames = [...new Set(payments.map((p) => p.contactName))];
  const firstConvo = contactNames.length > 0 ? findConversationByName(contactNames[0]!) : undefined;
  const contactCtx = firstConvo ? buildContactContext(firstConvo) : undefined;

  const summary = [
    `Total revenue: $${totalRevenue.toLocaleString()}`,
    '',
    'Recent payments:',
    ...payments.map((p) => `- ${p.contactName}: $${p.amount.toLocaleString()} on ${p.date}`),
  ].join('\n');

  return (
    <DashboardCard
      title="Revenue"
      subtitle={`$${totalRevenue.toLocaleString()} total`}
      chatContext={{ sourceId: 'revenue', cardType: 'revenue', title: 'Revenue', summary }}
      chatContactContext={contactCtx}
    >
      <div className="flex flex-col gap-2">
        <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          ${totalRevenue.toLocaleString()}
        </p>

        {payments.length > 0 && (
          <div className="flex flex-col">
            {payments.slice(0, 3).map((p, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg px-1.5 py-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                <div className="min-w-0">
                  <p className="truncate text-xs text-neutral-600 dark:text-neutral-400">{p.contactName}</p>
                  <p className="text-xs text-neutral-400">
                    {new Date(p.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <span className="ml-2 shrink-0 text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  +${p.amount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardCard>
  );
}
