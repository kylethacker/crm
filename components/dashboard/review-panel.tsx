'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ArrowUpIcon, SparklesIcon, XIcon } from '@/components/icons';
import { agentNameMap } from '@/lib/apps/data';
import { ContentPreviewCards } from './cards/content-preview-cards';
import { useActivityResolutions } from '@/lib/activity/use-resolutions';
import { useChatHistory } from '@/lib/chat/chat-history-context';
import type { AgentActivity } from '@/lib/activity/types';

type ChatMode = 'bar' | 'panel';

type DashboardChatProps = {
  reviewItem: AgentActivity | null;
  onClearReview: () => void;
};

type ChatMessage = {
  id: string;
  role: 'user' | 'agent';
  text: string;
};

function getAgentReply(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('approve') || lower.includes('looks good') || lower.includes('ship it') || lower.includes('go ahead')) {
    return "Great, I'll finalize this and proceed. You can always find it in the activity log.";
  }
  if (lower.includes('change') || lower.includes('update') || lower.includes('edit') || lower.includes('revise') || lower.includes('tweak')) {
    return "Understood. I'll make those changes and have a new version ready for your review shortly.";
  }
  return "Got it — I'll incorporate that feedback. Want me to revise and show you an updated version?";
}

function ReviewContext({ item, compact }: { item: AgentActivity; compact?: boolean }) {
  const agentName = agentNameMap.get(item.agentId) ?? item.agentId;

  return (
    <div className={cn(
      'flex items-start gap-2.5 rounded-lg border border-neutral-200 bg-neutral-50/60 dark:border-neutral-700 dark:bg-neutral-800/30',
      compact ? 'px-3 py-2' : 'px-4 py-3',
    )}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-neutral-400">{agentName}</span>
          <span className={cn(
            'rounded px-1 py-px text-xs font-medium',
            item.status === 'failed'
              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
          )}>
            {item.status === 'failed' ? 'Failed' : 'Needs approval'}
          </span>
        </div>
        <p className={cn(
          'mt-0.5 font-medium text-neutral-700 dark:text-neutral-300',
          compact ? 'text-xs' : 'text-sm',
        )}>
          {item.description}
        </p>
        {item.detail && (
          <p className={cn(
            'mt-1 leading-relaxed text-neutral-500 dark:text-neutral-400',
            compact ? 'text-xs' : 'text-xs',
          )}>
            {item.detail}
          </p>
        )}
        {item.contentPreviews && item.contentPreviews.length > 0 ? (
          <ContentPreviewCards items={item.contentPreviews} />
        ) : item.preview && item.preview.length > 0 ? (
          <dl className={cn(
            'mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-lg bg-white/60 dark:bg-neutral-900/30',
            compact ? 'px-2 py-1.5' : 'px-2.5 py-2',
          )}>
            {item.preview.map((block) => (
              <div key={block.label} className="col-span-2 flex gap-2">
                <dt className={cn('shrink-0 font-medium text-neutral-400', compact ? 'text-xs' : 'text-xs')}>
                  {block.label}
                </dt>
                <dd className={cn('min-w-0 whitespace-pre-line text-neutral-600 dark:text-neutral-300', compact ? 'text-xs' : 'text-xs')}>
                  {block.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </div>
  );
}

export function DashboardChat({ reviewItem, onClearReview }: DashboardChatProps) {
  const [mode, setMode] = useState<ChatMode>('bar');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { resolve } = useActivityResolutions();
  const { createSession, selectSession, findSessionByArtifact } = useChatHistory();
  const router = useRouter();

  const prevReviewIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (reviewItem && reviewItem.id !== prevReviewIdRef.current) {
      prevReviewIdRef.current = reviewItem.id;
      setMessages([]);
      setMode('panel');
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [reviewItem]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    });
  }, []);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', text };
    const agentMsg: ChatMessage = { id: `a-${Date.now()}`, role: 'agent', text: getAgentReply(text) };

    setMessages((prev) => [...prev, userMsg, agentMsg]);
    setInput('');
    if (mode === 'bar') setMode('panel');
    scrollToBottom();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      if (mode === 'panel' && messages.length === 0) handleClose();
    }
  };

  const handleClose = () => {
    setMode('bar');
    setMessages([]);
    setInput('');
    prevReviewIdRef.current = null;
    onClearReview();
  };

  const handleResolve = (resolution: 'approved' | 'dismissed') => {
    if (reviewItem) resolve(reviewItem.id, resolution);
    handleClose();
  };

  const handleExpand = () => {
    if (!reviewItem) return;
    const agentName = agentNameMap.get(reviewItem.agentId) ?? reviewItem.agentId;
    const existing = findSessionByArtifact(reviewItem.id);
    if (existing) {
      selectSession(existing.id);
    } else {
      createSession({
        artifactContext: {
          type: 'review-item',
          agentId: reviewItem.agentId,
          agentName,
          description: reviewItem.description,
          detail: reviewItem.detail,
          preview: reviewItem.preview,
          contentPreviews: reviewItem.contentPreviews,
          status: reviewItem.status,
          sourceId: reviewItem.id,
        },
      });
    }
    router.push('/');
  };

  // Bar / Panel (floating at bottom center)
  return (
    <div className={cn(
      'pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-6 pb-5',
    )}>
      <div className={cn(
        'pointer-events-auto flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_16px_40px_rgba(0,0,0,0.12),0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-200 ease-out dark:bg-neutral-900 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_16px_40px_rgba(0,0,0,0.4),0_4px_16px_rgba(0,0,0,0.3)]',
        mode === 'panel' ? 'h-[420px] w-full max-w-xl' : 'w-full max-w-lg',
      )}>
        {/* Panel header — only visible in panel mode */}
        {mode === 'panel' && (
          <div className="flex shrink-0 items-center justify-between border-b border-neutral-100 px-4 py-2.5 dark:border-neutral-800/60">
            <div className="flex items-center gap-2">
              <SparklesIcon className="size-3.5 text-neutral-400" />
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                {reviewItem ? `Reviewing · ${agentNameMap.get(reviewItem.agentId) ?? reviewItem.agentId}` : 'AI Assistant'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleExpand}
                className="flex size-6 cursor-pointer items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                aria-label="Open in full chat"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 3h6v6" />
                  <path d="M9 21H3v-6" />
                  <path d="m21 3-7 7" />
                  <path d="m3 21 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="flex size-6 cursor-pointer items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
                aria-label="Close"
              >
                <XIcon width={12} height={12} />
              </button>
            </div>
          </div>
        )}

        {/* Review context — panel mode */}
        {mode === 'panel' && reviewItem && (
          <div className="max-h-[180px] shrink-0 overflow-y-auto px-4 pt-3">
            <ReviewContext item={reviewItem} compact />
          </div>
        )}

        {/* Messages — panel mode */}
        {mode === 'panel' && (
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
            {messages.length === 0 ? (
              <p className="py-4 text-center text-xs text-neutral-400">
                {reviewItem ? 'Share feedback or ask questions about this item' : 'Ask me anything about your business'}
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      'max-w-[80%] rounded-xl px-3 py-1.5 text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'rounded-br-sm bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                        : 'rounded-bl-sm bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
                    )}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Input bar — always visible */}
        <div className={cn(
          mode === 'panel' && 'border-t border-neutral-100 dark:border-neutral-800/60',
        )}>
          {/* Approve / Dismiss — panel mode with review item */}
          {mode === 'panel' && reviewItem && (
            <div className="flex items-center gap-1.5 px-4 pt-2.5">
              <button type="button" onClick={() => handleResolve('approved')} className="cursor-pointer rounded-md bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200">
                Approve
              </button>
              <button type="button" onClick={() => handleResolve('dismissed')} className="cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300">
                Dismiss
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 px-4 py-3">
            {mode === 'bar' && (
              <SparklesIcon className="size-4 shrink-0 text-neutral-300 dark:text-neutral-600" />
            )}
            <input
              ref={mode === 'bar' ? undefined : inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => { if (mode === 'bar') setMode('panel'); }}
              placeholder={reviewItem ? 'Give feedback...' : 'Ask anything...'}
              className="min-w-0 flex-1 bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-400 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim()}
              className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-neutral-100 text-neutral-500 transition-colors hover:bg-neutral-200 disabled:cursor-default disabled:opacity-30 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
            >
              <ArrowUpIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
