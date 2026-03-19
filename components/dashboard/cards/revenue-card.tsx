import { DashboardCard } from '../dashboard-card';
import type { RevenuePayment } from '@/lib/dashboard/types';
import { findConversationByName } from '@/lib/messages/mock-data';
import { buildContactContext } from '@/lib/messages/use-start-contact-chat';

type RevenueCardProps = {
  totalRevenue: number;
  payments: RevenuePayment[];
  insight?: string;
};

export function RevenueCard({ totalRevenue, payments }: RevenueCardProps) {
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
      description="Total earned"
      value={`$${totalRevenue.toLocaleString()}`}
      cta="View revenue details"
      chatContext={{ sourceId: 'revenue', cardType: 'revenue', title: 'Revenue', summary }}
      chatContactContext={contactCtx}
    />
  );
}
