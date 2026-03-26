'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import type { Design, DesignFormat } from '@/lib/studio/types';
import { getPreset } from '@/lib/studio/templates';
import { ChatComposer } from '@/components/chat/chat-composer';
import { MessageItem } from '@/components/chat/message';

type StudioChatProps = {
  chatId: string;
  format: DesignFormat;
  width: number;
  height: number;
  currentDesign: Design | null;
  onBack: () => void;
};

const starterPrompts = [
  'A bold summer sale promo with vibrant colors',
  'Minimalist and elegant with lots of whitespace',
  'Dark theme with neon accent colors',
  'Playful and colorful with geometric shapes',
];

const backIcon = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

export function StudioChat({
  chatId,
  format,
  width,
  height,
  currentDesign,
  onBack,
}: StudioChatProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const currentDesignRef = useRef(currentDesign);
  currentDesignRef.current = currentDesign;

  const studioContextRef = useRef({ format, width, height });
  studioContextRef.current = { format, width, height };

  const transportRef = useRef(
    new DefaultChatTransport({
      body: () => ({
        agent: 'studio' as const,
        studioContext: {
          ...studioContextRef.current,
          currentDesign: currentDesignRef.current?.elements.length
            ? {
                name: currentDesignRef.current.name,
                background: currentDesignRef.current.background,
                elements: currentDesignRef.current.elements,
              }
            : undefined,
        },
      }),
    }),
  );

  const { messages, sendMessage, stop, status } = useChat({
    id: chatId,
    transport: transportRef.current,
    experimental_throttle: 50,
  });

  const isPending = status === 'submitted' || status === 'streaming';
  const isStreaming = status === 'streaming';

  useEffect(() => {
    if (!isAtBottom) return;
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages, isPending, isAtBottom]);

  useEffect(() => {
    if (!isStreaming) return;
    const el = scrollRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => {
      if (isAtBottom) el.scrollTo({ top: el.scrollHeight, behavior: 'instant' as ScrollBehavior });
    });
    const content = el.firstElementChild;
    if (content) observer.observe(content);
    return () => observer.disconnect();
  }, [isStreaming, isAtBottom]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setIsAtBottom(atBottom);
  }, []);

  const handleSubmit = useCallback(
    (text: string) => {
      sendMessage({ text });
    },
    [sendMessage],
  );

  const handleFormSubmit = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    handleSubmit(text);
  }, [input, handleSubmit]);

  const preset = getPreset(format);
  const showStarters = messages.length === 0 && !isPending;

  return (
    <div className="relative flex h-full flex-col bg-app-surface dark:bg-neutral-950">
      <button
        type="button"
        onClick={onBack}
        className="absolute top-3 left-3 z-10 flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
      >
        {backIcon}
        Back
      </button>

      {showStarters ? (
        <div className="flex flex-1 flex-col items-center justify-center px-4">
          <div className="mb-1">
            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
              {preset.label} &middot; {preset.description}
            </span>
          </div>
          <div className="mb-6 text-center">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              What do you want to create?
            </h2>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Describe your design and the AI will generate 3 options
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {starterPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSubmit(prompt)}
                className="cursor-pointer rounded-md border border-neutral-200/80 bg-app-surface px-3.5 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full flex-1 overflow-y-auto"
          role="log"
          aria-label="Studio chat"
        >
          <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 pt-16 pb-48">
            {messages.map((message, i) => (
              <MessageItem
                key={message.id}
                message={message}
                isStreaming={isStreaming && message.role === 'assistant' && i === messages.length - 1}
              />
            ))}

            {isPending && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-3">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 dark:bg-white">
                  <span className="text-xs font-medium text-white dark:text-neutral-900">AI</span>
                </div>
                <div className="flex items-center pt-1">
                  <div className="flex gap-1">
                    <span className="size-1.5 animate-pulse rounded-full bg-neutral-400 dark:bg-neutral-500" />
                    <span className="size-1.5 animate-pulse rounded-full bg-neutral-400 [animation-delay:150ms] dark:bg-neutral-500" />
                    <span className="size-1.5 animate-pulse rounded-full bg-neutral-400 [animation-delay:300ms] dark:bg-neutral-500" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-2 px-4 pb-4">
        <div className="pointer-events-none absolute inset-0 flex justify-center px-4">
          <div className="w-full max-w-4xl bg-linear-to-t from-white from-85% to-transparent dark:from-neutral-950" />
        </div>

        {!isAtBottom && messages.length > 0 && (
          <button
            type="button"
            onClick={() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })}
            className="relative z-10 cursor-pointer rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 shadow-sm transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800"
          >
            Go to latest message
          </button>
        )}

        <ChatComposer
          value={input}
          onChange={setInput}
          onSubmit={handleFormSubmit}
          onStop={stop}
          isPending={isPending}
          placeholder="Describe your design or ask for changes..."
          autoFocus
          rows={2}
          className="w-full max-w-4xl"
        />
        <p className="relative text-center text-xs text-neutral-400 dark:text-neutral-600">
          AI can make mistakes. Check the design carefully.
        </p>
      </div>
    </div>
  );
}
