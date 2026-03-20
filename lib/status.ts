import type { AgentActivityStatus } from '@/lib/activity/types';
import type { ContactStatus } from '@/lib/messages/types';

export const ACTIVITY_STATUS_DOT: Record<AgentActivityStatus, string> = {
  completed: 'bg-neutral-900 dark:bg-neutral-100',
  running: 'bg-neutral-400 animate-pulse',
  'needs-approval': 'bg-neutral-500',
  failed: 'bg-neutral-500',
};

export const ACTIVITY_STATUS_INDICATOR: Record<AgentActivityStatus, { color: string; label: string }> = {
  completed: { color: 'bg-neutral-900 dark:bg-neutral-100', label: 'Completed' },
  running: { color: 'bg-neutral-400 animate-pulse', label: 'Running' },
  'needs-approval': { color: 'bg-neutral-500', label: 'Needs approval' },
  failed: { color: 'bg-neutral-500', label: 'Failed' },
};

export const CONTACT_STATUS_COLOR: Record<ContactStatus, string> = {
  customer: 'bg-neutral-900 dark:bg-neutral-100',
  lead: 'bg-neutral-500',
  prospect: 'bg-neutral-300 dark:bg-neutral-600',
};

export const CONTACT_STATUS_CONFIG: Record<ContactStatus, { label: string; color: string }> = {
  customer: { label: 'Customers', color: 'bg-neutral-900 dark:bg-neutral-100' },
  lead: { label: 'Leads', color: 'bg-neutral-500' },
  prospect: { label: 'Prospects', color: 'bg-neutral-300 dark:bg-neutral-600' },
};
