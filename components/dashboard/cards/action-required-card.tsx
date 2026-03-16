'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useActivityResolutions } from '@/lib/activity/use-resolutions';
import type { AgentActivity } from '@/lib/activity/types';
import { formatRelativeTime } from '@/lib/format';
import { ContentPreviewCards } from './content-preview-cards';

type ActionRequiredCardProps = {
  item: AgentActivity;
  onReview?: (item: AgentActivity) => void;
};

export function ActionRequiredCard({ item, onReview }: ActionRequiredCardProps) {
  const { resolutions, resolve } = useActivityResolutions();
  const [showResolved, setShowResolved] = useState(false);

  const resolution = resolutions[item.id];
  const isFading = !!resolution && !showResolved;

  useEffect(() => {
    if (!resolution) setShowResolved(false);
  }, [resolution]);

  if (showResolved && resolution) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-black/3 animate-fade-in dark:bg-white/4">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400"><path d="M20 6 9 17l-5-5" /></svg>
        <p className="mt-0.5 text-xs text-neutral-400">
          {resolution === 'approved' ? 'Approved' : 'Dismissed'}
        </p>
      </div>
    );
  }

  const isFailed = item.status === 'failed';
  const hasContentPreviews = item.contentPreviews && item.contentPreviews.length > 0;
  const hasPreview = item.preview && item.preview.length > 0;

  return (
    <div
      className={cn(
        'h-full transition-opacity duration-500 ease-out',
        isFading && 'opacity-0',
      )}
      onTransitionEnd={() => {
        if (isFading) setShowResolved(true);
      }}
    >
      <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-black/3 dark:bg-white/4">
        <div className="flex items-baseline gap-2 px-6 pt-5">
          <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {item.description}
          </p>
          <span className="shrink-0 text-sm text-black/55 dark:text-white/45">
            {formatRelativeTime(item.timestamp)}
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-6 pt-3 pb-1">
          {hasContentPreviews ? (
            <div className="flex flex-1 items-start overflow-x-auto scrollbar-none">
              <ContentPreviewCards items={item.contentPreviews!} />
            </div>
          ) : hasPreview ? (
            <div className="overflow-hidden rounded-[10px] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.05)] dark:bg-neutral-900 dark:shadow-[0_4px_16px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.06)]">
              {item.preview!.map((block, i) => (
                <div
                  key={block.label}
                  className={cn(
                    'flex gap-3 px-3.5 py-2',
                    i !== 0 && 'border-t border-neutral-100 dark:border-neutral-800/50',
                  )}
                >
                  <dt className="w-[76px] shrink-0 text-[11px] text-neutral-400 dark:text-neutral-500">
                    {block.label}
                  </dt>
                  <dd className="min-w-0 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
                    {block.value}
                  </dd>
                </div>
              ))}
            </div>
          ) : item.detail ? (
            <p className="text-sm leading-relaxed text-black/55 dark:text-white/45">
              {item.detail}
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2 px-6 pb-5 pt-2">
          {onReview && (
            <button
              type="button"
              onClick={() => onReview(item)}
              className="cursor-pointer rounded-xl bg-neutral-100 px-3 py-1 text-sm font-medium text-black/55 shadow-[0_4px_4px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.1)] transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white/55 dark:shadow-[0_4px_4px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.08)] dark:hover:bg-neutral-700"
            >
              Review
            </button>
          )}
          <button
            type="button"
            onClick={() => resolve(item.id, 'approved')}
            className="cursor-pointer rounded-xl px-3 py-1 text-sm font-medium text-black/55 transition-colors hover:bg-black/5 dark:text-white/55 dark:hover:bg-white/5"
          >
            {isFailed ? 'Retry' : 'Approve'}
          </button>
          <button
            type="button"
            onClick={() => resolve(item.id, 'dismissed')}
            className="cursor-pointer rounded-xl px-3 py-1 text-sm font-medium text-black/55 transition-colors hover:bg-black/5 dark:text-white/55 dark:hover:bg-white/5"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
