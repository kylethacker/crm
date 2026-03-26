'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useChat } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import { DefaultChatTransport } from 'ai';
import { toast } from 'sonner';
import type { AgentName } from '@/lib/ai/agents';
import { useChatHistory } from '@/lib/chat/chat-history-context';
import type { ArtifactContext, ContactContext, MarketplaceAgentContext } from '@/lib/chat/chat-history';
import { loadChatMessages, saveChatMessages } from '@/lib/chat/chat-history';
import { getSuggestedResponses } from '@/lib/chat/suggested-responses';
import { Messages } from './messages';
import { ChatInput } from './chat-input';
import { ChatContextSidebar } from './chat-context-sidebar';

const consumedSessions = new Set<string>();

const starterPrompts = [
  { label: 'What should I work on today?', text: 'What should I work on today?' },
  { label: 'Who needs a follow-up?', text: 'Who needs a follow-up?' },
  { label: 'Show me my upcoming schedule', text: 'Show me my upcoming schedule' },
  { label: 'Any overdue invoices?', text: 'Any overdue invoices?' },
];

export function Chat() {
  const router = useRouter();
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [agent, setAgent] = useState<AgentName>('operator');
  const scrollRef = useRef<HTMLDivElement>(null);
  const { sessions, activeSessionId, createSession, updateTitle, consumeInitialMessage } = useChatHistory();
  const titleSetRef = useRef<Set<string>>(new Set());

  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId),
    [sessions, activeSessionId],
  );
  const artifactContext = activeSession?.artifactContext;
  const contactContext = activeSession?.contactContext;
  const marketplaceAgentContext = activeSession?.marketplaceAgentContext;

  useEffect(() => {
    if (!activeSessionId) createSession({ agentName: agent });
  }, [activeSessionId, createSession, agent]);

  const agentRef = useRef(agent);
  agentRef.current = agent;

  const artifactContextRef = useRef<ArtifactContext | undefined>(artifactContext);
  artifactContextRef.current = artifactContext;

  const contactContextRef = useRef<ContactContext | undefined>(contactContext);
  contactContextRef.current = contactContext;

  const marketplaceAgentContextRef = useRef<MarketplaceAgentContext | undefined>(marketplaceAgentContext);
  marketplaceAgentContextRef.current = marketplaceAgentContext;

  const transportRef = useRef(
    new DefaultChatTransport({
      body: () => ({
        agent: agentRef.current,
        ...(artifactContextRef.current && { artifactContext: artifactContextRef.current }),
        ...(contactContextRef.current && { contactContext: contactContextRef.current }),
        ...(marketplaceAgentContextRef.current && { marketplaceAgentContext: marketplaceAgentContextRef.current }),
      }),
    }),
  );

  const { messages, setMessages, sendMessage, stop, status, error } = useChat({
    id: activeSessionId ?? undefined,
    transport: transportRef.current,
    experimental_throttle: 50,
  });

  const isPending = status === 'submitted' || status === 'streaming';
  const isStreaming = status === 'streaming';

  // Restore persisted messages when switching to a session
  const restoredRef = useRef<string | null>(null);
  useEffect(() => {
    if (!activeSessionId || activeSessionId === restoredRef.current) return;
    restoredRef.current = activeSessionId;
    const saved = loadChatMessages(activeSessionId) as UIMessage[];
    if (saved.length > 0) {
      setMessages(saved);
    }
  }, [activeSessionId, setMessages]);

  // Persist messages when an exchange completes
  useEffect(() => {
    if (!activeSessionId || messages.length === 0 || status !== 'ready') return;
    saveChatMessages(activeSessionId, messages);
  }, [activeSessionId, messages, status]);

  useEffect(() => {
    if (!activeSessionId || status !== 'ready') return;
    if (consumedSessions.has(activeSessionId)) return;
    const pending = consumeInitialMessage(activeSessionId);
    if (pending) {
      consumedSessions.add(activeSessionId);
      sendMessage({ text: pending });
    }
  }, [activeSessionId, status, sendMessage, consumeInitialMessage]);

  useEffect(() => {
    if (error) {
      toast.error('Something went wrong', { description: error.message });
    }
  }, [error]);

  useEffect(() => {
    if (!activeSessionId) return;
    if (titleSetRef.current.has(activeSessionId)) return;
    const firstUserMsg = messages.find((m) => m.role === 'user');
    if (firstUserMsg) {
      const parts = firstUserMsg.parts.filter((p) => p.type === 'text');
      const text = parts.map((p) => p.text).join(' ').trim();
      if (text) {
        titleSetRef.current.add(activeSessionId);
        updateTitle(activeSessionId, text.length > 40 ? text.slice(0, 40) + '…' : text);
      }
    }
  }, [messages, activeSessionId, updateTitle]);

  const handleSubmit = (text: string) => {
    sendMessage({ text });
  };

  const suggestions = useMemo(() => getSuggestedResponses(messages, status), [messages, status]);
  const showStarters = messages.length === 0 && !isPending;

  return (
    <div className="flex h-full">
      <div className="relative min-w-0 flex-1 bg-app-surface dark:bg-neutral-950">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute top-3 left-3 z-10 flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>
        {showStarters ? (
          <div className="flex h-full flex-col items-center justify-center px-4">
            <div className="mb-6 text-center">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                How can I help?
              </h2>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Ask me anything about your business
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt.text}
                  type="button"
                  onClick={() => handleSubmit(prompt.text)}
                  className="cursor-pointer rounded-md border border-neutral-200/80 bg-app-surface px-3.5 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <Messages
            messages={messages}
            isPending={isPending}
            isStreaming={isStreaming}
            scrollRef={scrollRef}
            onAtBottomChange={setIsAtBottom}
            artifactContext={artifactContext}
            contactContext={contactContext}
            suggestions={suggestions}
            onSuggestionSelect={handleSubmit}
          />
        )}

        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-2 px-4 pb-4">
          <div className="pointer-events-none absolute inset-0 flex justify-center px-4">
            <div className="w-full max-w-3xl bg-linear-to-t from-white from-85% to-transparent dark:from-neutral-950" />
          </div>

          {!isAtBottom && messages.length > 0 && (
            <button
              type="button"
              onClick={() =>
                scrollRef.current?.scrollTo({
                  top: scrollRef.current.scrollHeight,
                  behavior: 'smooth',
                })
              }
              className="relative z-10 cursor-pointer rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
            >
              Go to latest message
            </button>
          )}

          <ChatInput
            onSubmit={handleSubmit}
            onStop={stop}
            isPending={isPending}
            agent={agent}
            onAgentChange={setAgent}
          />
        </div>
      </div>

      <ChatContextSidebar
        artifactContext={artifactContext}
        contactContext={contactContext}
        messages={messages}
        isStreaming={isStreaming}
        onSendMessage={handleSubmit}
      />
    </div>
  );
}
