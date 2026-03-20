'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { SparklesIcon } from '@/components/icons';
import type { Conversation } from '@/lib/messages/types';
import { ConversationList } from './conversation-list';
import { MessageThread } from './message-thread';
import { ContactPanel } from './contact-panel';
import { AiAssistInput } from './ai-assist-input';
import { AiAssistSidebar } from './ai-assist-sidebar';

type Tab = 'conversation' | 'overview';

type MessagesPageProps = {
  conversations: Conversation[];
};

export function MessagesPage({ conversations }: MessagesPageProps) {
  const [activeId, setActiveId] = useState<string | null>(conversations[0]?.contact.id ?? null);
  const [tab, setTab] = useState<Tab>('conversation');
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);

  const activeConversation = conversations.find((c) => c.contact.id === activeId);

  return (
    <div className="flex h-full">
      {/* Conversation list - left panel */}
      <div className="w-80 shrink-0">
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={(id) => {
            setActiveId(id);
            setTab('conversation');
          }}
        />
      </div>

      {/* Center content area */}
      {activeConversation ? (
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header with tabs */}
          <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                  {activeConversation.contact.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {activeConversation.contact.name}
                </h3>
                <p className="text-xs text-neutral-500">{activeConversation.contact.phone}</p>
              </div>
            </div>

            <div className="flex rounded-lg border border-neutral-200 dark:border-neutral-700" role="tablist">
              {(['overview', 'conversation'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={cn(
                    'cursor-pointer px-3.5 py-1.5 text-xs font-medium capitalize transition-colors first:rounded-l-[7px] last:rounded-r-[7px]',
                    tab === t
                      ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                      : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300',
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div className="relative min-h-0 flex-1 flex">
            <div className="min-w-0 flex-1">
              {tab === 'conversation' ? (
                <MessageThread conversation={activeConversation} />
              ) : (
                <div className="relative h-full">
                  <ContactPanel
                    contact={activeConversation.contact}
                    bookings={activeConversation.bookings}
                    activity={activeConversation.activity}
                  />
                  <AiAssistInput conversation={activeConversation} />
                </div>
              )}
            </div>

            {tab === 'conversation' && !aiSidebarOpen && (
              <button
                type="button"
                onClick={() => setAiSidebarOpen(true)}
                className="absolute bottom-4 right-4 z-10 flex size-11 cursor-pointer items-center justify-center rounded-2xl bg-white text-neutral-500 shadow-[0_0_0_1px_rgba(0,0,0,0.05),0_4px_12px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.05)] transition-colors hover:bg-neutral-50 hover:text-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_4px_12px_rgba(0,0,0,0.3)] dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              >
                <SparklesIcon width={20} height={20} />
                <span className="sr-only">Open AI Assist</span>
              </button>
            )}

            {tab === 'conversation' && aiSidebarOpen && (
              <AiAssistSidebar
                conversation={activeConversation}
                onClose={() => setAiSidebarOpen(false)}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="flex min-w-0 flex-1 items-center justify-center">
          <p className="text-sm text-neutral-400">Select a customer</p>
        </div>
      )}
    </div>
  );
}
