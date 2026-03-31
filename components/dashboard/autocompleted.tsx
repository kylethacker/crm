'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAgentDef } from '@/lib/marketplace/data';
import { useActiveAgents } from '@/lib/marketplace/active-agents-context';
import { useContactsStore } from '@/lib/contacts/store';
import { categoryColors, inferCategory } from '@/lib/dashboard/types';
import type { AgentAction } from '@/lib/marketplace/types';
import type { EntityDrawerState } from '@/components/entity-drawers/types';
import type { Conversation } from '@/lib/messages/types';

function formatTime(ts: string): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ActionRow({
  action,
  onOpenDrawer,
  conversations,
}: {
  action: AgentAction;
  onOpenDrawer?: (state: EntityDrawerState) => void;
  conversations: Conversation[];
}) {
  const def = getAgentDef(action.agentId);
  const agentName = def?.name ?? action.agentId;
  const category = inferCategory(action.tool, action.agentId);
  const colors = categoryColors[category];
  const router = useRouter();

  const handleViewDetails = () => {
    if (action.contactName) {
      const match = conversations.find((c) => c.contact.name === action.contactName);
      if (match) {
        router.push(`/messages?contactId=${match.contact.id}`);
      }
    }
  };

  const btnClass =
    'mt-0.5 shrink-0 rounded-md border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-600 opacity-0 transition-all hover:bg-neutral-50 group-hover:opacity-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700';

  return (
    <div className="group px-3 py-3">
      {/* Row 1: Category pill + Agent name + Timestamp */}
      <div className="mb-1.5 flex items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${colors.pill}`}
        >
          {category}
        </span>
        <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
          {agentName}
        </span>
        <span className="ml-auto text-[11px] text-neutral-400 dark:text-neutral-500">
          {formatTime(action.createdAt)}
        </span>
      </div>

      {/* Row 2: Contact name (if any) */}
      {action.contactName && (
        <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {action.contactName}
        </p>
      )}

      {/* Row 3: Description + View details */}
      <div className="flex items-start gap-3">
        <p className={`min-w-0 flex-1 text-sm text-neutral-700 dark:text-neutral-300 ${action.contactName ? 'mt-0.5' : ''}`}>
          {action.description}
        </p>
        {action.contactName ? (
          <button type="button" onClick={handleViewDetails} className={btnClass}>
            View details
          </button>
        ) : (
          <Link href={`/team/${action.agentId}`} className={btnClass}>
            View details
          </Link>
        )}
      </div>
    </div>
  );
}

export function Autocompleted({
  onOpenDrawer,
}: {
  onOpenDrawer?: (state: EntityDrawerState) => void;
}) {
  const { agents } = useActiveAgents();
  const { conversations } = useContactsStore();
  const actions = agents
    .flatMap((a) => a.recentActions.filter((act) => act.status === 'executed'))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const [showAll, setShowAll] = useState(false);

  if (actions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-200 px-6 py-12 dark:border-neutral-800">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No autocompleted actions yet.
        </p>
      </div>
    );
  }

  const visible = showAll ? actions : actions.slice(0, 8);
  const hasMore = actions.length > 8;

  return (
    <div className="flex flex-col">
      {visible.map((action, i) => (
        <div key={action.id}>
          {i > 0 && <div className="mx-3 border-t border-neutral-100 dark:border-neutral-800/60" />}
          <ActionRow action={action} onOpenDrawer={onOpenDrawer} conversations={conversations} />
        </div>
      ))}

      {hasMore && !showAll && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="py-2.5 text-center text-xs font-medium text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
        >
          Show {actions.length - 8} more
        </button>
      )}
    </div>
  );
}
