'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/lib/messages/types';
import { CONTACT_STATUS_COLOR } from '@/lib/status';
import { Input } from '@/components/ui/input';

function conversationMatchesQuery(conv: Conversation, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const c = conv.contact;
  if (c.name.toLowerCase().includes(q)) return true;
  if (c.phone.replace(/\D/g, '').includes(q.replace(/\D/g, '')) || c.phone.toLowerCase().includes(q)) return true;
  if (c.email?.toLowerCase().includes(q)) return true;
  if (c.company?.toLowerCase().includes(q)) return true;
  if (c.tags?.some((t) => t.toLowerCase().includes(q))) return true;
  const last = conv.messages[conv.messages.length - 1];
  if (last?.text.toLowerCase().includes(q)) return true;
  return false;
}

type ConversationListProps = {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatTime(timestamp: string) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}


export function ConversationList({ conversations, activeId, onSelect }: ConversationListProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () => conversations.filter((c) => conversationMatchesQuery(c, search)),
    [conversations, search],
  );

  const searchTrimmed = search.trim();
  const countLabel = searchTrimmed
    ? `${filtered.length} match${filtered.length !== 1 ? 'es' : ''}`
    : `${conversations.length} conversations`;

  return (
    <div className="flex h-full flex-col border-r border-neutral-200 dark:border-neutral-800">
      <div className="shrink-0 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between px-4 py-3">
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Customers</h2>
          <span className="text-xs text-neutral-400">{countLabel}</span>
        </div>
        <div className="px-4 pb-3">
          <div className="relative">
            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" aria-hidden>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </span>
            <Input
              type="search"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 border-neutral-200 bg-neutral-50 py-0 pl-8 pr-3 text-sm dark:border-neutral-700 dark:bg-neutral-900/50"
              aria-label="Search customers"
            />
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-xs text-neutral-400">
            {searchTrimmed ? 'No customers match your search.' : 'No conversations yet.'}
          </p>
        ) : (
          filtered.map((conv) => {
          const lastMessage = conv.messages[conv.messages.length - 1];
          const isActive = conv.contact.id === activeId;

          return (
            <button
              key={conv.contact.id}
              type="button"
              onClick={() => onSelect(conv.contact.id)}
              className={cn(
                'flex w-full cursor-pointer gap-3 px-4 py-3 text-left transition-colors',
                isActive
                  ? 'bg-neutral-100 dark:bg-neutral-800/80'
                  : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/40',
              )}
            >
              <div className="relative shrink-0">
                <div className="flex size-10 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                    {getInitials(conv.contact.name)}
                  </span>
                </div>
                <span
                  className={cn(
                    'absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-white dark:border-neutral-950',
                    CONTACT_STATUS_COLOR[conv.contact.status],
                  )}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {conv.contact.name}
                  </span>
                  {lastMessage && (
                    <span className="shrink-0 text-xs text-neutral-400">
                      {formatTime(lastMessage.timestamp)}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  {lastMessage ? (
                    <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                      {lastMessage.direction === 'outbound' && (
                        <span className="text-neutral-400 dark:text-neutral-500">You: </span>
                      )}
                      {lastMessage.text}
                    </p>
                  ) : (
                    <p className="text-xs text-neutral-400 italic">No messages</p>
                  )}
                  {conv.unreadCount > 0 && (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-medium text-white dark:bg-neutral-100 dark:text-neutral-900">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })
        )}
      </div>
    </div>
  );
}
