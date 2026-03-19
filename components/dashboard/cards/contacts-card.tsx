import { DashboardCard } from '../dashboard-card';
import type { ContactsByStatus } from '@/lib/dashboard/types';
import { CONTACT_STATUS_CONFIG } from '@/lib/status';

type ContactsCardProps = {
  total: number;
  byStatus: ContactsByStatus;
  insight?: string;
};

export function ContactsCard({ total, byStatus }: ContactsCardProps) {
  const summary = [
    `${total} total contacts`,
    ...Object.entries(byStatus).map(([status, count]) => `- ${CONTACT_STATUS_CONFIG[status as keyof typeof CONTACT_STATUS_CONFIG]?.label ?? status}: ${count}`),
  ].join('\n');

  return (
    <DashboardCard
      title="Contacts"
      description={`${total} total`}
      value={String(total)}
      cta="View all contacts"
      chatContext={{ sourceId: 'contacts', cardType: 'contacts', title: 'Contacts', summary }}
    />
  );
}
