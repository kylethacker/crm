import { DashboardCard } from '../dashboard-card';
import { cn } from '@/lib/utils';
import type { ContactsByStatus } from '@/lib/dashboard/types';
import { CONTACT_STATUS_CONFIG } from '@/lib/status';

type ContactsCardProps = {
  total: number;
  byStatus: ContactsByStatus;
  insight?: string;
};

export function ContactsCard({ total, byStatus, insight }: ContactsCardProps) {
  const summary = [
    `${total} total contacts`,
    ...Object.entries(byStatus).map(([status, count]) => `- ${CONTACT_STATUS_CONFIG[status as keyof typeof CONTACT_STATUS_CONFIG]?.label ?? status}: ${count}`),
  ].join('\n');

  return (
    <DashboardCard
      title="Contacts"
      subtitle={`${total} total`}
      chatContext={{ sourceId: 'contacts', cardType: 'contacts', title: 'Contacts', summary }}
    >
      <div className="flex flex-col gap-2.5">
        <div className="flex h-2 overflow-hidden rounded-full">
          {(Object.keys(CONTACT_STATUS_CONFIG) as (keyof typeof CONTACT_STATUS_CONFIG)[]).map((status) => {
            const pct = total > 0 ? (byStatus[status] / total) * 100 : 0;
            if (pct === 0) return null;
            return (
              <div
                key={status}
                className={cn('transition-all', CONTACT_STATUS_CONFIG[status].color)}
                style={{ width: `${pct}%` }}
              />
            );
          })}
        </div>
        <div className="flex flex-col gap-1">
          {(Object.keys(CONTACT_STATUS_CONFIG) as (keyof typeof CONTACT_STATUS_CONFIG)[]).map((status) => (
            <div key={status} className="flex items-center justify-between px-0.5">
              <div className="flex items-center gap-1.5">
                <span className={cn('inline-block size-2 rounded-full', CONTACT_STATUS_CONFIG[status].color)} />
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {CONTACT_STATUS_CONFIG[status].label}
                </span>
              </div>
              <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                {byStatus[status]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}
