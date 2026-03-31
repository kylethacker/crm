'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const contactIdParam = searchParams.get('contactId');
  const initialId = (contactIdParam && conversations.some((c) => c.contact.id === contactIdParam))
    ? contactIdParam
    : conversations[0]?.contact.id ?? null;

  const [activeId, setActiveId] = useState<string | null>(initialId);
  const [tab, setTab] = useState<Tab>(contactIdParam ? 'conversation' : 'conversation');
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);

  const activeConversation = conversations.find((c) => c.contact.id === activeId);

  return (
    <div className="flex h-full bg-app-canvas dark:bg-neutral-950">
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
        <div className="flex min-w-0 flex-1 flex-col bg-app-surface dark:bg-neutral-950">
          {/* Header + Linear-style tabs */}
          <div className="shrink-0 border-b border-neutral-200/70 dark:border-neutral-800">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 ring-1 ring-neutral-200/80 dark:bg-neutral-800 dark:ring-neutral-700">
                  <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
                    {activeConversation.contact.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
                    {activeConversation.contact.name}
                  </h3>
                  <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">{activeConversation.contact.phone}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-0 px-4" role="tablist" aria-label="Customer view">
              {(
                [
                  { id: 'overview' as const, label: 'Overview' },
                  { id: 'conversation' as const, label: 'Messages' },
                ] as const
              ).map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={cn(
                    '-mb-px cursor-pointer border-b-2 px-3 pb-2.5 pt-0.5 text-xs font-medium transition-colors',
                    tab === id
                      ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-neutral-100'
                      : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200',
                  )}
                >
                  {label}
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
