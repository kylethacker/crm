'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { MarketplaceAgentContext } from '@/lib/chat/chat-history';
import type { AgentSettings } from '@/lib/marketplace/types';
import { getSuggestedResponses } from '@/lib/chat/suggested-responses';
import { MessageItem } from '@/components/chat/message';
import { ArrowUpIcon, StopIcon } from '@/components/icons';

type AgentChatProps = {
  agentContext: MarketplaceAgentContext;
  agentSettings?: AgentSettings;
  /** Auto-send this message on mount (used for onboarding after hire) */
  initialMessage?: string;
};

export function AgentChat({ agentContext, agentSettings, initialMessage }: AgentChatProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initialSent = useRef(false);

  const agentContextRef = useRef(agentContext);
  agentContextRef.current = agentContext;

  const agentSettingsRef = useRef(agentSettings);
  agentSettingsRef.current = agentSettings;

  const transportRef = useRef(
    new DefaultChatTransport({
      body: () => ({
        agent: 'operator' as const,
        marketplaceAgentId: agentContextRef.current.agentId,
        agentSettings: agentSettingsRef.current,
        marketplaceAgentContext: agentContextRef.current,
      }),
    }),
  );

  const { messages, sendMessage, stop, status } = useChat({
    transport: transportRef.current,
    experimental_throttle: 50,
  });

  const isPending = status === 'submitted' || status === 'streaming';
  const isStreaming = status === 'streaming';

  // Auto-send initial message for onboarding
  useEffect(() => {
    if (initialMessage && !initialSent.current) {
      initialSent.current = true;
      sendMessage({ text: initialMessage });
    }
  }, [initialMessage, sendMessage]);

  // Auto-scroll to bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = useCallback(
    (text: string) => {
      if (!text.trim() || isPending) return;
      sendMessage({ text: text.trim() });
      setInput('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    },
    [isPending, sendMessage],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(input);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  const suggestions = useMemo(() => getSuggestedResponses(messages, status), [messages, status]);

  return (
    <div className="flex flex-1 flex-col">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              Talk to {agentContext.agentName}
            </p>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Ask about performance, activity, or adjust behavior.
            </p>
            <div className="mt-4 flex flex-col gap-1.5">
              {[
                `How is ${agentContext.agentName} performing?`,
                'Show me recent activity',
                'Any recommendations?',
              ].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSubmit(prompt)}
                  className="cursor-pointer rounded-lg bg-white px-3 py-2 text-left text-xs text-neutral-600 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.06)] transition-colors hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-400 dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.06)] dark:hover:bg-neutral-700"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-[720px] flex-col gap-4">
            {messages.map((msg) => (
              <MessageItem key={msg.id} message={msg} isStreaming={isStreaming && msg.id === messages[messages.length - 1]?.id} />
            ))}
            {isPending && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-1.5 py-2">
                <span className="size-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:0ms]" />
                <span className="size-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:150ms]" />
                <span className="size-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:300ms]" />
              </div>
            )}
            {suggestions.length > 0 && !isPending && (
              <div className="flex flex-wrap gap-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s.text}
                    type="button"
                    onClick={() => handleSubmit(s.text)}
                    className="cursor-pointer rounded-lg bg-white px-2.5 py-1.5 text-xs text-neutral-600 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.06)] transition-colors hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-400 dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.06)] dark:hover:bg-neutral-700"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-neutral-200/60 px-4 py-3 dark:border-neutral-800/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(input);
          }}
          className="relative mx-auto max-w-[720px] overflow-hidden rounded-xl bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.06)] dark:bg-neutral-900 dark:shadow-[0_1px_2px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.06)]"
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${agentContext.agentName}...`}
            rows={1}
            className="block w-full resize-none bg-transparent px-3 pt-2.5 pb-2 text-sm leading-relaxed outline-none placeholder:text-neutral-400 dark:text-white"
          />
          <div className="flex justify-end px-2 pb-2">
            {isPending ? (
              <button
                type="button"
                onClick={stop}
                className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                <StopIcon />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex size-7 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white transition-colors hover:bg-neutral-700 disabled:cursor-default disabled:opacity-30 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
              >
                <ArrowUpIcon />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
