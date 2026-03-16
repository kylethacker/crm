'use client';

import { cn } from '@/lib/utils';
import type { Conversation } from '@/lib/messages/types';
import { CONTACT_STATUS_COLOR } from '@/lib/status';

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
  return (
    <div className="flex h-full flex-col border-r border-neutral-200 dark:border-neutral-800">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <h2 className="text-sm font-semibold">Messages</h2>
        <span className="text-xs text-neutral-400">{conversations.length} conversations</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.map((conv) => {
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
        })}
      </div>
    </div>
  );
}
