'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useChatHistory } from '@/lib/chat/chat-history-context';
import { Button } from '@/components/ui/button';
import { categoryColors } from '@/lib/dashboard/types';
import type { ActionQueueCard, CardAttachment } from '@/lib/dashboard/types';
import type { EntityDrawerState } from '@/components/entity-drawers/types';
import type { TableViewType } from '@/lib/views/types';

/** Truncate text for collapsed view */
const TRUNCATE_LENGTH = 120;

function truncate(text: string): { short: string; isTruncated: boolean } {
  if (text.length <= TRUNCATE_LENGTH) return { short: text, isTruncated: false };
  // Cut at last space before limit
  const cut = text.lastIndexOf(' ', TRUNCATE_LENGTH);
  return { short: text.slice(0, cut > 0 ? cut : TRUNCATE_LENGTH) + '...', isTruncated: true };
}

function formatTimestamp(ts: string): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMin / 60);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}


// ── Expandable message bubble ────────────────────────────────────────────────

function MessageBubble({
  label,
  text,
  isSummary,
}: {
  label: string;
  text: string;
  /** If true, renders with a subtle "summary" badge to distinguish from real messages */
  isSummary?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const { short, isTruncated } = truncate(text);
  const displayText = expanded ? text : short;

  return (
    <div className="rounded-md border border-neutral-100 bg-neutral-50 px-3 py-2 dark:border-neutral-800 dark:bg-neutral-800/50">
      <div className="mb-1 flex items-center gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          {label}
        </span>
        {isSummary && (
          <span className="rounded bg-neutral-200/60 px-1 py-px text-[9px] font-medium uppercase text-neutral-400 dark:bg-neutral-700/60 dark:text-neutral-500">
            Summary
          </span>
        )}
      </div>
      <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        {displayText}
      </p>
      {isTruncated && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-xs font-medium text-neutral-400 transition-colors hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}

// ── Draft bubble (the agent's proposed reply) ────────────────────────────────

function DraftBubble({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const { short, isTruncated } = truncate(text);
  const displayText = expanded ? text : short;

  return (
    <div className="rounded-md border border-blue-100 bg-blue-50/50 px-3 py-2 dark:border-blue-900/40 dark:bg-blue-950/20">
      <div className="mb-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400 dark:text-blue-500">
          Draft reply
        </span>
      </div>
      <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
        {displayText}
      </p>
      {isTruncated && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-xs font-medium text-blue-400 transition-colors hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}

// ── Attachment chip ──────────────────────────────────────────────────────────

const attachmentIcons: Record<CardAttachment['type'], string> = {
  invoice: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  quote: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
};

function AttachmentChip({
  attachment,
  onOpen,
}: {
  attachment: CardAttachment;
  onOpen?: (state: EntityDrawerState) => void;
}) {
  const entityType: TableViewType = attachment.type === 'invoice' ? 'invoices' : 'quotes';

  return (
    <button
      type="button"
      onClick={() => onOpen?.({ entityType, recordId: attachment.id })}
      className="inline-flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-left transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-neutral-400 dark:text-neutral-500">
        <path d={attachmentIcons[attachment.type]} />
      </svg>
      <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
        {attachment.label}
      </span>
      {attachment.meta && (
        <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
          {attachment.meta}
        </span>
      )}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-neutral-300 dark:text-neutral-600">
        <path d="m9 18 6-6-6-6" />
      </svg>
    </button>
  );
}

// ── Main ActionCard component ────────────────────────────────────────────────

type CardState = 'idle' | 'approved' | 'collapsing';

export function ActionCard({
  card,
  onOpenDrawer,
  onDismiss,
  onEdit,
}: {
  card: ActionQueueCard;
  onOpenDrawer?: (state: EntityDrawerState) => void;
  onDismiss?: (cardId: string) => void;
  /** Called when user clicks Edit. If not provided, navigates to the agent page. */
  onEdit?: (card: ActionQueueCard) => void;
}) {
  const router = useRouter();
  const { createSession } = useChatHistory();
  const colors = categoryColors[card.category];

  const [state, setState] = useState<CardState>('idle');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // After "approved" confirmation, collapse and remove
  useEffect(() => {
    if (state === 'approved') {
      const timer = setTimeout(() => setState('collapsing'), 600);
      return () => clearTimeout(timer);
    }
  }, [state]);

  useEffect(() => {
    if (state === 'collapsing') {
      const timer = setTimeout(() => onDismiss?.(card.id), 350);
      return () => clearTimeout(timer);
    }
  }, [state, card.id, onDismiss]);

  const handleApprove = () => {
    setState('approved');
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(card);
    } else if (card.agentId) {
      // Navigate to agent page with edit context — pass full card data
      sessionStorage.setItem('agent-edit-card', JSON.stringify(card));
      router.push(`/team/${card.agentId}?edit=1`);
    }
  };

  const handleGenericAction = (action: ActionQueueCard['actions'][0]) => {
    if (action.prompt) {
      createSession({ initialMessage: action.prompt });
      router.push('/chat');
    }
  };

  // ── Wrapper classes for animation ──
  const wrapperClass =
    state === 'approved'
      ? 'transition-all duration-500 ease-out'
      : state === 'collapsing'
        ? 'transition-all duration-300 ease-in opacity-0 scale-y-0 origin-top -mt-1 max-h-0 overflow-hidden'
        : '';

  // ── Activation cards have their own layout ──
  if (card.type === 'activation') {
    return (
      <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100/50 dark:border-blue-900/50 dark:from-blue-950/40 dark:to-blue-950/20">
        <div className="px-4 py-4">
          <div className="mb-2">
            <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white dark:bg-blue-500">
              Setup
            </span>
          </div>
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {card.headline}
          </p>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            {card.body}
          </p>
          <div className="mt-3 flex gap-2">
            {card.actions.map((action, i) => (
              <Button
                key={i}
                variant={action.variant === 'primary' ? 'solid' : 'outline'}
                size="sm"
                onClick={() => handleGenericAction(action)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Determine what content to show ──
  const hasInbound = !!card.inboundMessage;
  const hasSummary = !!card.contextSummary;
  const hasDraft = card.type === 'approval' && !!card.draftContent && card.draftContent !== card.body;
  const isApprovable = hasDraft;

  return (
    <div ref={cardRef} className={wrapperClass}>
      <div
        className={`rounded-lg border border-neutral-200 border-l-[3px] bg-white dark:border-neutral-800 dark:bg-neutral-900 ${colors.border} ${
          state === 'approved' ? 'border-green-300 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20' : ''
        } transition-colors duration-300`}
      >
        {/* Approved overlay */}
        {state === 'approved' && (
          <div className="flex items-center gap-2.5 px-4 py-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 dark:text-green-400">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <span className="text-sm font-medium text-green-700 dark:text-green-300">
              Sent{card.contactName ? ` to ${card.contactName}` : ''}
            </span>
          </div>
        )}

        {/* Normal card content — hidden when approved */}
        {state !== 'approved' && (
          <div className="px-4 py-4">
            {/* Header row: category pill + agent + timestamp */}
            <div className="mb-2 flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${colors.pill}`}
              >
                {card.category}
              </span>
              {card.agentName && (
                <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                  {card.agentName}
                </span>
              )}
              <span className="ml-auto text-[11px] text-neutral-400 dark:text-neutral-500">
                {formatTimestamp(card.timestamp)}
              </span>
            </div>

            {/* Contact name + description inline */}
            <p className="text-sm text-neutral-700 dark:text-neutral-300">
              {card.contactName && (
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{card.contactName}</span>
              )}
              {card.contactName ? ' — ' : ''}{card.body}
            </p>

            {/* Collapsible context / inbound message */}
            {(hasInbound || hasSummary) && (
              <>
                <button
                  type="button"
                  onClick={() => setDetailsOpen((o) => !o)}
                  className="mt-2 flex items-center gap-1 text-xs font-medium text-neutral-400 transition-colors hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-transform duration-200 ${detailsOpen ? 'rotate-90' : ''}`}
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                  {detailsOpen ? 'Hide details' : 'Show details'}
                </button>

                {detailsOpen && (
                  <div className="mt-2 flex flex-col gap-2">
                    {hasInbound && (
                      <MessageBubble
                        label={card.contactName ? `${card.contactName.split(' ')[0]}` : 'Customer'}
                        text={card.inboundMessage!}
                      />
                    )}

                    {!hasInbound && hasSummary && (
                      <MessageBubble
                        label="Context"
                        text={card.contextSummary!}
                        isSummary
                      />
                    )}
                  </div>
                )}
              </>
            )}

            {/* Draft reply — always visible */}
            {hasDraft && (
              <div className="mt-3">
                <DraftBubble text={card.draftContent!} />
              </div>
            )}

            {/* Attachments — always visible */}
            {card.attachments && card.attachments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {card.attachments.map((att) => (
                  <AttachmentChip key={att.id} attachment={att} onOpen={onOpenDrawer} />
                ))}
              </div>
            )}

            {/* Action buttons */}
            {card.actions.length > 0 && (
              <div className="mt-3 flex gap-2">
                {isApprovable ? (
                  <>
                    <Button variant="solid" size="sm" onClick={handleApprove}>
                      Approve
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                      Edit
                    </Button>
                  </>
                ) : (
                  card.actions.map((action, i) => (
                    <Button
                      key={i}
                      variant={action.variant === 'primary' ? 'solid' : 'outline'}
                      size="sm"
                      onClick={() => handleGenericAction(action)}
                    >
                      {action.label}
                    </Button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
