'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DrawerRoot,
  DrawerPortal,
  DrawerBackdrop,
  DrawerViewport,
  DrawerPopup,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
} from '@/components/ui/slide-over';
import { useActiveAgents } from '@/lib/marketplace/active-agents-context';
import { useContactsStore } from '@/lib/contacts/store';
import type { AgentAction } from '@/lib/marketplace/types';

const statusStyles: Record<string, string> = {
  executed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  proposed: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  dismissed: 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400',
};

function formatLogTime(ts: string): string {
  const date = new Date(ts);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function ActivityLog() {
  const { agents } = useActiveAgents();
  const { conversations } = useContactsStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<string | null>(null);
  const actions = agents
    .flatMap((a) => a.recentActions)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const agentIds = [...new Set(actions.map((a) => a.agentId))];
  const filtered = filter ? actions.filter((a) => a.agentId === filter) : actions;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/70"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M12 8v4l3 3" />
          <circle cx="12" cy="12" r="10" />
        </svg>
        Activity Log
      </button>

      <DrawerRoot open={open} onOpenChange={setOpen}>
        <DrawerPortal>
          <DrawerBackdrop />
          <DrawerViewport>
            <DrawerPopup>
              <DrawerContent>
                <DrawerHeader title="Activity Log" />
                <div className="flex gap-2 overflow-x-auto border-b border-neutral-200 px-4 py-2 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setFilter(null)}
                    className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                      filter === null
                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                        : 'text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                    }`}
                  >
                    All
                  </button>
                  {agentIds.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setFilter(id)}
                      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                        filter === id
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                          : 'text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {id.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </button>
                  ))}
                </div>
                <DrawerBody className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    {filtered.map((action) => {
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
                        <div
                          key={action.id}
                          className="group flex flex-col gap-1 rounded-md px-3 py-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium ${statusStyles[action.status] ?? statusStyles.executed}`}
                            >
                              {action.status}
                            </span>
                            <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                              {formatLogTime(action.createdAt)}
                            </span>
                          </div>
                          {action.contactName && (
                            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                              {action.contactName}
                            </p>
                          )}
                          <div className="flex items-start gap-3">
                            <p className="min-w-0 flex-1 text-sm text-neutral-900 dark:text-neutral-100">
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
                    })}
                    {filtered.length === 0 && (
                      <p className="py-8 text-center text-sm text-neutral-400 dark:text-neutral-500">
                        No activity to show.
                      </p>
                    )}
                  </div>
                </DrawerBody>
              </DrawerContent>
            </DrawerPopup>
          </DrawerViewport>
        </DrawerPortal>
      </DrawerRoot>
    </>
  );
}
