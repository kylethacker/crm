'use client';

import type { ActionQueueCard, CardAttachment } from '@/lib/dashboard/types';
import { categoryColors } from '@/lib/dashboard/types';

// ── Attachment chip (reused from action-card pattern) ────────────────────────

const attachmentIcons: Record<CardAttachment['type'], string> = {
  invoice: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  quote: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
};

/**
 * Pre-rendered edit context block for the chat.
 * Shows contact info, context/inbound message, the draft, and any attachments
 * — all deterministically from the ActionQueueCard data, no LLM involved.
 */
export function EditContextBlock({ card }: { card: ActionQueueCard }) {
  const colors = categoryColors[card.category];
  const initials = card.contactName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      {/* Header — contact + category */}
      <div className="flex items-start gap-3 px-4 py-3">
        {card.contactName && (
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            {initials}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {card.contactName && (
              <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {card.contactName}
              </p>
            )}
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${colors.pill}`}
            >
              {card.category}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
            {card.body}
          </p>
        </div>
      </div>

      {/* Inbound message or context summary */}
      {(card.inboundMessage || card.contextSummary) && (
        <div className="border-t border-neutral-100 px-4 py-3 dark:border-neutral-800">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
            {card.inboundMessage ? (card.contactName ? `${card.contactName.split(' ')[0]}'s message` : 'Customer message') : 'Context'}
          </p>
          <div className="rounded-md border border-neutral-100 bg-neutral-50 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-800/50">
            <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {card.inboundMessage ?? card.contextSummary}
            </p>
          </div>
        </div>
      )}

      {/* Draft reply */}
      {card.draftContent && (
        <div className="border-t border-neutral-100 px-4 py-3 dark:border-neutral-800">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue-400 dark:text-blue-500">
            Draft reply
          </p>
          <div className="rounded-md border border-blue-100 bg-blue-50/50 px-3 py-2 dark:border-blue-900/40 dark:bg-blue-950/20">
            <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
              {card.draftContent}
            </p>
          </div>
        </div>
      )}

      {/* Attachments */}
      {card.attachments && card.attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t border-neutral-100 px-4 py-3 dark:border-neutral-800">
          {card.attachments.map((att) => (
            <div
              key={att.id}
              className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 dark:border-neutral-700 dark:bg-neutral-800"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-neutral-400 dark:text-neutral-500">
                <path d={attachmentIcons[att.type]} />
              </svg>
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                {att.label}
              </span>
              {att.meta && (
                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                  {att.meta}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
