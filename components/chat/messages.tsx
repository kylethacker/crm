'use client';

import { useEffect, useRef, useCallback, type RefObject } from 'react';
import type { UIMessage } from 'ai';
import { MessageItem } from './message';

type MessagesProps = {
  messages: UIMessage[];
  isPending: boolean;
  isStreaming: boolean;
  scrollRef: RefObject<HTMLDivElement | null>;
  onAtBottomChange: (atBottom: boolean) => void;
};

export function Messages({ messages, isPending, isStreaming, scrollRef, onAtBottomChange }: MessagesProps) {
  const isAtBottomRef = useRef(true);
  const contentRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      if (isAtBottomRef.current) {
        const el = scrollRef.current;
        if (el) el.scrollTo({ top: el.scrollHeight, behavior });
      }
    },
    [scrollRef],
  );

  const checkAtBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (atBottom !== isAtBottomRef.current) {
      isAtBottomRef.current = atBottom;
      onAtBottomChange(atBottom);
    }
  }, [scrollRef, onAtBottomChange]);

  // Track scroll position
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkAtBottom, { passive: true });
    return () => el.removeEventListener('scroll', checkAtBottom);
  }, [scrollRef, checkAtBottom]);

  // Scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, isPending, scrollToBottom]);

  // Auto-scroll as streaming content grows using ResizeObserver
  useEffect(() => {
    if (!isStreaming) return;
    const el = contentRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      scrollToBottom('instant');
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [isStreaming, scrollToBottom]);

  if (messages.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4 pt-14 pb-36">
        <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
          What can I help with?
        </h2>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto" role="log" aria-label="Chat messages">
      <div ref={contentRef} className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pt-16 pb-48">
        {messages.map((message, i) => (
          <MessageItem
            key={message.id}
            message={message}
            isStreaming={
              isStreaming &&
              message.role === 'assistant' &&
              i === messages.length - 1
            }
          />
        ))}

        {isPending && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-3">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 dark:bg-white">
              <span className="text-xs font-medium text-white dark:text-neutral-900">AI</span>
            </div>
            <div className="flex items-center pt-1">
              <ThinkingDots />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex gap-1">
      <span className="size-1.5 animate-pulse rounded-full bg-neutral-400 dark:bg-neutral-500" />
      <span className="size-1.5 animate-pulse rounded-full bg-neutral-400 [animation-delay:150ms] dark:bg-neutral-500" />
      <span className="size-1.5 animate-pulse rounded-full bg-neutral-400 [animation-delay:300ms] dark:bg-neutral-500" />
    </div>
  );
}
