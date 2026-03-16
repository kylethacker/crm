'use client';

import { useEffect, useRef, useCallback, type RefObject } from 'react';
import type { UIMessage } from 'ai';
import { cn } from '@/lib/utils';
import type { ArtifactContext, ContactContext } from '@/lib/chat/chat-history';
import { MessageItem } from './message';

type MessagesProps = {
  messages: UIMessage[];
  isPending: boolean;
  isStreaming: boolean;
  scrollRef: RefObject<HTMLDivElement | null>;
  onAtBottomChange: (atBottom: boolean) => void;
  artifactContext?: ArtifactContext;
  contactContext?: ContactContext;
};

export function Messages({ messages, isPending, isStreaming, scrollRef, onAtBottomChange, artifactContext, contactContext }: MessagesProps) {
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

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkAtBottom, { passive: true });
    return () => el.removeEventListener('scroll', checkAtBottom);
  }, [scrollRef, checkAtBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isPending, scrollToBottom]);

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

  const hasContext = !!(artifactContext || contactContext);

  if (messages.length === 0 && !hasContext) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4 pt-14 pb-36">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
          What can I help with?
        </h2>
      </div>
    );
  }

  if (messages.length === 0 && hasContext) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4 pt-14 pb-36">
        <div className="flex w-full max-w-3xl flex-col items-center gap-6">
          <ContextCard artifactContext={artifactContext} contactContext={contactContext} />
          <p className="text-sm text-neutral-400">Ask a question about this data</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="h-full overflow-y-auto" role="log" aria-label="Chat messages">
      <div ref={contentRef} className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pt-16 pb-48">
        {hasContext && <ContextCard artifactContext={artifactContext} contactContext={contactContext} />}
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

// ── Inline context card (appears as AI's first "message") ──

function ContextCard({ artifactContext, contactContext }: { artifactContext?: ArtifactContext; contactContext?: ContactContext }) {
  return (
    <div className="flex w-full gap-3">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 dark:bg-white">
        <span className="text-xs font-medium text-white dark:text-neutral-900">AI</span>
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        {artifactContext && <ArtifactCard context={artifactContext} />}
        {contactContext && !artifactContext && <ContactOnlyCard contact={contactContext} />}
        {contactContext && artifactContext && (
          <p className="mt-2 text-xs text-neutral-400">
            with {contactContext.name}{contactContext.company ? ` · ${contactContext.company}` : ''}
          </p>
        )}
      </div>
    </div>
  );
}

function ArtifactCard({ context }: { context: ArtifactContext }) {
  if (context.type === 'dashboard-card') return <DashboardCardInline context={context} />;
  if (context.type === 'analytics') return <AnalyticsInline context={context} />;
  return <ReviewItemInline context={context} />;
}

function DashboardCardInline({ context }: { context: Extract<ArtifactContext, { type: 'dashboard-card' }> }) {
  const lines = context.summary
    .split('\n')
    .filter(Boolean)
    .filter((l) => !l.startsWith('Contacts referenced'));

  return (
    <div>
      <p className="text-sm leading-relaxed text-neutral-900 dark:text-neutral-100">
        Here&apos;s your <span className="font-medium">{context.title}</span> data:
      </p>
      <div className="mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
        {lines.slice(0, 6).map((line, i) => (
          <p
            key={i}
            className={cn(
              'px-3.5 py-1.5 text-xs text-neutral-600 dark:text-neutral-400',
              i !== 0 && 'border-t border-neutral-200/60 dark:border-neutral-800/60',
            )}
          >
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function AnalyticsInline({ context }: { context: Extract<ArtifactContext, { type: 'analytics' }> }) {
  return (
    <div>
      <p className="text-sm leading-relaxed text-neutral-900 dark:text-neutral-100">
        Here&apos;s your <span className="font-medium">Website Analytics</span> overview:
      </p>
      <div className="mt-2 grid grid-cols-4 gap-px overflow-hidden rounded-xl border border-neutral-200 bg-neutral-200 dark:border-neutral-800 dark:bg-neutral-800">
        {[
          { label: 'Visitors', value: context.totalVisitors.toLocaleString() },
          { label: 'Page views', value: context.pageViews.toLocaleString() },
          { label: 'Bounce rate', value: `${context.bounceRate}%` },
          { label: 'Avg. session', value: context.avgSessionDuration },
        ].map((m) => (
          <div key={m.label} className="bg-neutral-50 px-3 py-2 dark:bg-neutral-900">
            <p className="text-[10px] text-neutral-400">{m.label}</p>
            <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{m.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewItemInline({ context }: { context: Extract<ArtifactContext, { type: 'review-item' }> }) {
  return (
    <div>
      <p className="text-sm leading-relaxed text-neutral-900 dark:text-neutral-100">
        Reviewing an item from <span className="font-medium">{context.agentName}</span>:
      </p>
      <div className="mt-2 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center gap-2 px-3.5 py-2">
          <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">{context.description}</p>
          <span className={cn(
            'ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium',
            context.status === 'failed'
              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
          )}>
            {context.status === 'failed' ? 'Failed' : 'Pending'}
          </span>
        </div>
        {context.contentPreviews && context.contentPreviews.length > 0 && (
          <div className="flex gap-2 overflow-x-auto border-t border-neutral-200/60 p-3 dark:border-neutral-800/60">
            {context.contentPreviews.map((item) => (
              <div
                key={item.title}
                className="h-[140px] w-[110px] shrink-0 overflow-hidden rounded-lg bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.04)] dark:bg-neutral-800 dark:shadow-[0_2px_8px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.05)]"
              >
                {item.image ? (
                  <img src={item.image} alt={item.title} className="size-full object-cover" />
                ) : (
                  <div className="size-full" style={{ backgroundColor: item.color }} />
                )}
              </div>
            ))}
          </div>
        )}
        {context.preview && context.preview.length > 0 && context.preview.map((block) => (
          <div key={block.label} className="flex gap-3 border-t border-neutral-200/60 px-3.5 py-1.5 dark:border-neutral-800/60">
            <span className="shrink-0 text-[11px] text-neutral-400">{block.label}</span>
            <span className="text-xs text-neutral-600 dark:text-neutral-400">{block.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactOnlyCard({ contact }: { contact: ContactContext }) {
  const initials = contact.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div>
      <p className="text-sm leading-relaxed text-neutral-900 dark:text-neutral-100">
        Chatting about <span className="font-medium">{contact.name}</span>:
      </p>
      <div className="mt-2 flex items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
          <span className="text-[10px] font-medium text-neutral-600 dark:text-neutral-300">{initials}</span>
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200">{contact.name}</p>
          <p className="text-[11px] text-neutral-400">
            {[contact.company, contact.status, contact.phone].filter(Boolean).join(' · ')}
          </p>
        </div>
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
