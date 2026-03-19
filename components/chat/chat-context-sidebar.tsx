'use client';

import { useState, useMemo } from 'react';
import type { UIMessage } from 'ai';
import { cn } from '@/lib/utils';
import { CheckIcon } from '@/components/icons';
import type { ArtifactContext, ContactContext } from '@/lib/chat/chat-history';
import { getToolName } from '@/lib/chat/suggested-responses';
import { formatCurrency, getInitials } from '@/lib/format';

// ── Types ──

type InvoiceArtifact = {
  id: string;
  toolCallId: string;
  invoiceNumber: string;
  contactName: string;
  total: number;
  status: string;
  dueDate: string;
  items: { description: string; amount: number }[];
  revisionOf?: string;
};

type MessageDraft = {
  id: string;
  toolCallId: string;
  contactName: string;
  text: string;
  status: string;
  revisionOf?: string;
};

type BookingArtifact = {
  id: string;
  toolCallId: string;
  contactName: string;
  title: string;
  date: string;
  time: string;
  status: string;
};

type PaymentArtifact = {
  id: string;
  toolCallId: string;
  contactName: string;
  amount: number;
  invoiceNumber: string;
};

type AgentStep = {
  id: string;
  label: string;
  status: 'done' | 'active' | 'pending';
};

type QueueItem = {
  index: number;
  label: string;
  detail: string;
  status: 'pending' | 'current' | 'drafted' | 'sent' | 'skipped';
};

// ── Scroll to tool call ──

const HIGHLIGHT_CLASSES = ['ring-2', 'ring-neutral-900/20', 'dark:ring-white/20'] as const;

function clearHighlights() {
  document.querySelectorAll('[data-tool-call-id].ring-2').forEach((el) => {
    el.classList.remove(...HIGHLIGHT_CLASSES);
  });
}

function scrollToToolCall(toolCallId: string) {
  const el = document.querySelector(`[data-tool-call-id="${toolCallId}"]`);
  if (!el) return;
  clearHighlights();
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add(...HIGHLIGHT_CLASSES);
  setTimeout(() => el.classList.remove(...HIGHLIGHT_CLASSES), 1500);
}

// ── Extraction ──

function extractToolOutputs(messages: UIMessage[]) {
  const invoices: InvoiceArtifact[] = [];
  const messageDrafts: MessageDraft[] = [];
  const bookings: BookingArtifact[] = [];
  const payments: PaymentArtifact[] = [];
  const sentInvoiceIds = new Set<string>();
  const sentMessageIds = new Set<string>();
  const toolNames: string[] = [];

  for (const msg of messages) {
    for (const part of msg.parts) {
      if (!('toolCallId' in part) || part.state !== 'output-available' || !part.output) continue;
      const toolName = getToolName(part);
      const toolCallId = part.toolCallId;
      toolNames.push(toolName);

      if (toolName === 'createInvoice') {
        invoices.push({ ...(part.output as Omit<InvoiceArtifact, 'toolCallId'>), toolCallId });
      } else if (toolName === 'draftMessage') {
        messageDrafts.push({ ...(part.output as Omit<MessageDraft, 'toolCallId'>), toolCallId });
      } else if (toolName === 'sendInvoice') {
        sentInvoiceIds.add((part.output as { invoiceId: string }).invoiceId);
      } else if (toolName === 'sendMessage') {
        sentMessageIds.add((part.output as { messageId: string }).messageId);
      } else if (toolName === 'createBooking') {
        bookings.push({ ...(part.output as Omit<BookingArtifact, 'toolCallId'>), toolCallId });
      } else if (toolName === 'recordPayment') {
        payments.push({ ...(part.output as Omit<PaymentArtifact, 'toolCallId'>), toolCallId });
      }
    }
  }

  // Build revision chains — group revisions under the latest version
  const resolvedInvoices = invoices.map((inv) => ({
    ...inv,
    status: sentInvoiceIds.has(inv.id) ? 'sent' : inv.status,
  }));
  const resolvedDrafts = messageDrafts.map((msg) => ({
    ...msg,
    status: sentMessageIds.has(msg.id) ? 'sent' : msg.status,
  }));

  // Build revision chains using a parent→child map for O(n) traversal
  function buildRevisionChains<T extends { id: string; revisionOf?: string }>(items: T[]) {
    const childOf = new Map<string, string>(); // parent id → child id
    for (const item of items) {
      if (item.revisionOf) childOf.set(item.revisionOf, item.id);
    }
    const superseded = new Set(childOf.keys());
    const prevVersions = new Map<string, T[]>();

    for (const item of items) {
      if (!superseded.has(item.id)) continue;
      // Walk forward to find the latest in the chain
      let latestId = item.id;
      while (childOf.has(latestId)) latestId = childOf.get(latestId)!;
      const prev = prevVersions.get(latestId) ?? [];
      prev.push(item);
      prevVersions.set(latestId, prev);
    }

    return { superseded, prevVersions };
  }

  const { superseded: supersededInvoiceIds, prevVersions: invoicePrevVersions } = buildRevisionChains(resolvedInvoices);
  const { superseded: supersededDraftIds, prevVersions: draftPrevVersions } = buildRevisionChains(resolvedDrafts);

  return {
    invoices: resolvedInvoices.filter((i) => !supersededInvoiceIds.has(i.id)),
    messageDrafts: resolvedDrafts.filter((d) => !supersededDraftIds.has(d.id)),
    invoicePrevVersions,
    draftPrevVersions,
    bookings,
    payments,
    toolNames,
  };
}

function extractQueueItems(messages: UIMessage[], messageDrafts: MessageDraft[]): QueueItem[] {
  // Find the first user message with a numbered list
  const firstUserMsg = messages.find((m) => m.role === 'user');
  if (!firstUserMsg) return [];

  const text = firstUserMsg.parts
    .filter((p): p is Extract<typeof p, { type: 'text' }> => p.type === 'text')
    .map((p) => p.text)
    .join('\n');

  // Match numbered list items like "1. Label — Detail" or "1. Label - Detail"
  const itemRegex = /^\d+\.\s+(.+?)(?:\s+[—–-]\s+(.+))?$/gm;
  const items: QueueItem[] = [];
  let match;

  while ((match = itemRegex.exec(text)) !== null) {
    items.push({
      index: items.length + 1,
      label: match[1]!.trim(),
      detail: match[2]?.trim() ?? '',
      status: 'pending',
    });
  }

  if (items.length === 0) return [];

  // Build a set of drafted/sent contact names from tool outputs
  const draftedNames = new Set(messageDrafts.map((d) => d.contactName.toLowerCase()));
  const sentNames = new Set(
    messageDrafts.filter((d) => d.status === 'sent').map((d) => d.contactName.toLowerCase()),
  );

  // Collect user messages that contain "skip" (word-boundary match, not substring)
  const skipRegex = /\bskip\b/i;
  const userSkipTexts = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.parts.filter((p): p is Extract<typeof p, { type: 'text' }> => p.type === 'text').map((p) => p.text).join(' ').toLowerCase())
    .filter((t) => skipRegex.test(t));

  // Determine status for each item
  let foundCurrent = false;
  for (const item of items) {
    const nameLower = item.label.toLowerCase();
    // Extract person name: handles "Unread message from Sarah Chen", "Sarah Chen", multi-word names with hyphens/apostrophes
    const nameMatch = nameLower.match(/(?:from |to |with )?([\p{L}][\p{L}'\-]+(?: [\p{L}][\p{L}'\-]+)+)$/u);
    const personName = nameMatch ? nameMatch[1]! : nameLower;

    if (sentNames.has(personName)) {
      item.status = 'sent';
    } else if (draftedNames.has(personName)) {
      item.status = 'drafted';
    } else if (userSkipTexts.some((t) => t.includes(personName))) {
      item.status = 'skipped';
    } else if (!foundCurrent) {
      // First non-completed item is current
      item.status = 'current';
      foundCurrent = true;
    }
  }

  return items;
}

function deriveAgentSteps(
  messages: UIMessage[],
  toolNames: string[],
  isStreaming: boolean,
): AgentStep[] {
  if (messages.length === 0) return [];

  const steps: AgentStep[] = [];
  const hasUserMessage = messages.some((m) => m.role === 'user');

  if (hasUserMessage) {
    steps.push({ id: 'analyze', label: 'Analyzing request', status: 'done' });
  }

  const toolLabels: Record<string, string> = {
    getContactSummary: 'Looked up contact',
    getTodaySchedule: 'Checked schedule',
    createInvoice: 'Created invoice',
    sendInvoice: 'Sent invoice',
    draftMessage: 'Drafted message',
    sendMessage: 'Sent message',
    createBooking: 'Created booking',
    cancelBooking: 'Cancelled booking',
    recordPayment: 'Recorded payment',
    updateContactStatus: 'Updated status',
    addNote: 'Added note',
    addTag: 'Added tag',
    calculate: 'Calculated',
  };

  for (const [i, name] of toolNames.entries()) {
    const label = toolLabels[name] ?? name;
    steps.push({ id: `tool-${i}`, label, status: 'done' });
  }

  if (isStreaming) {
    steps.push({ id: 'thinking', label: 'Working...', status: 'active' });
  }

  return steps;
}

// ── Shared components ──

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('text-neutral-400 transition-transform duration-200', open && 'rotate-90')}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function Section({ title, defaultOpen = true, count, children }: {
  title: string;
  defaultOpen?: boolean;
  count?: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-neutral-200/60 dark:border-neutral-800/60">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center gap-2 px-5 py-3.5 text-left"
      >
        <ChevronIcon open={open} />
        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{title}</span>
        {count != null && count > 0 && (
          <span className="rounded-full bg-neutral-200/60 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
            {count}
          </span>
        )}
      </button>
      {open && <div className="px-5 pb-4">{children}</div>}
    </div>
  );
}

// ── Progress ──

function ProgressSteps({ steps }: { steps: AgentStep[] }) {
  if (steps.length === 0) {
    return (
      <p className="text-xs text-neutral-400 dark:text-neutral-500">
        See task progress as the agent works.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      {steps.map((step) => (
        <div key={step.id} className="flex items-center gap-2.5 py-1">
          <div className="flex w-4 justify-center">
            {step.status === 'done' ? (
              <div className="flex size-4 items-center justify-center rounded-full bg-neutral-900 dark:bg-neutral-100">
                <CheckIcon className="size-2.5 text-white dark:text-neutral-900" />
              </div>
            ) : step.status === 'active' ? (
              <div className="size-3.5 animate-pulse rounded-full border-2 border-neutral-400" />
            ) : (
              <div className="size-2 rounded-full bg-neutral-300 dark:bg-neutral-600" />
            )}
          </div>
          <span className={cn(
            'text-xs',
            step.status === 'done'
              ? 'text-neutral-700 dark:text-neutral-300'
              : step.status === 'active'
                ? 'text-neutral-500 dark:text-neutral-400'
                : 'text-neutral-400 dark:text-neutral-500',
          )}>
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Contact card ──

const statusLabels: Record<string, string> = {
  customer: 'Customer',
  lead: 'Lead',
  prospect: 'Prospect',
};

function ContactCard({ contact }: { contact: ContactContext }) {
  const initials = getInitials(contact.name);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3.5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
          <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
            {initials}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {contact.name}
          </p>
          <div className="flex items-center gap-1.5">
            {contact.company && (
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                {contact.company}
              </span>
            )}
            <span className="rounded bg-neutral-100 px-1.5 py-px text-[10px] font-medium text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
              {statusLabels[contact.status] ?? contact.status}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px]">
        <span className="text-neutral-500">{contact.phone}</span>
        {contact.email && <span className="text-neutral-500">{contact.email}</span>}
      </div>

      {contact.tags && contact.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {contact.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {contact.revenue != null && contact.revenue > 0 && (
        <div className="mt-2 flex items-center justify-between rounded-md bg-neutral-50 px-2.5 py-1.5 dark:bg-neutral-800/50">
          <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">Revenue</span>
          <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
            ${contact.revenue.toLocaleString()}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Actions taken cards ──


function ActionButton({ label, onClick, primary }: { label: string; onClick: () => void; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={primary
        ? 'cursor-pointer rounded-md bg-neutral-900 px-2 py-1 text-[10px] font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200'
        : 'cursor-pointer rounded-md px-2 py-1 text-[10px] font-medium text-neutral-500 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800'
      }
    >
      {label}
    </button>
  );
}

function PreviousVersions({ versions, label }: { versions: { toolCallId: string }[]; label: string }) {
  const [open, setOpen] = useState(false);
  if (versions.length === 0) return null;

  return (
    <div className="mt-2 border-t border-neutral-100 pt-1.5 dark:border-neutral-800/60">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="cursor-pointer text-[10px] text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-300"
      >
        {open ? 'Hide' : `${versions.length} previous ${label}`}
      </button>
      {open && (
        <div className="mt-1 flex flex-col gap-1">
          {versions.map((v, i) => (
            <button
              key={v.toolCallId}
              type="button"
              onClick={(e) => { e.stopPropagation(); scrollToToolCall(v.toolCallId); }}
              className="cursor-pointer rounded px-1.5 py-1 text-left text-[10px] text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
            >
              Version {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function InvoiceCard({ invoice, onAction, prevVersions = [] }: { invoice: InvoiceArtifact; onAction?: (text: string) => void; prevVersions?: InvoiceArtifact[] }) {
  const isSent = invoice.status === 'sent';
  return (
    <div
      onClick={() => scrollToToolCall(invoice.toolCallId)}
      className={cn(
        'cursor-pointer rounded-xl border bg-white p-3 transition-colors hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800/50',
        isSent
          ? 'border-emerald-200 dark:border-emerald-800/40'
          : 'border-neutral-200 dark:border-neutral-800',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
          {invoice.invoiceNumber}
        </span>
        <span className={cn(
          'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
          isSent
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        )}>
          {isSent ? 'Sent' : 'Draft'}
        </span>
      </div>
      <div className="mt-1.5 flex items-baseline justify-between">
        <span className="text-xs text-neutral-500">{invoice.contactName}</span>
        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {formatCurrency(invoice.total)}
        </span>
      </div>
      {!isSent && onAction && (
        <div className="mt-2 flex gap-1.5">
          <ActionButton label="Send" primary onClick={() => onAction(`Send invoice ${invoice.invoiceNumber} to ${invoice.contactName}`)} />
          <ActionButton label="Edit" onClick={() => onAction(`Edit invoice ${invoice.invoiceNumber}`)} />
        </div>
      )}
      <PreviousVersions versions={prevVersions} label={prevVersions.length === 1 ? 'version' : 'versions'} />
    </div>
  );
}

function MessageDraftCard({ draft, onAction, prevVersions = [] }: { draft: MessageDraft; onAction?: (text: string) => void; prevVersions?: MessageDraft[] }) {
  const isSent = draft.status === 'sent';
  return (
    <div
      onClick={() => scrollToToolCall(draft.toolCallId)}
      className={cn(
        'cursor-pointer rounded-xl border bg-white p-3 transition-colors hover:bg-neutral-50 dark:bg-neutral-900 dark:hover:bg-neutral-800/50',
        isSent
          ? 'border-emerald-200 dark:border-emerald-800/40'
          : 'border-neutral-200 dark:border-neutral-800',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-500 dark:text-neutral-400">
          To {draft.contactName}
        </span>
        <span className={cn(
          'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
          isSent
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        )}>
          {isSent ? 'Sent' : 'Draft'}
        </span>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-neutral-700 line-clamp-2 dark:text-neutral-300">
        {draft.text}
      </p>
      {!isSent && onAction && (
        <div className="mt-2 flex gap-1.5">
          <ActionButton label="Send" primary onClick={() => onAction(`Send the message to ${draft.contactName}`)} />
          <ActionButton label="Edit" onClick={() => onAction(`Edit the message to ${draft.contactName}`)} />
        </div>
      )}
      <PreviousVersions versions={prevVersions} label={prevVersions.length === 1 ? 'version' : 'versions'} />
    </div>
  );
}

function BookingCard({ booking, onAction }: { booking: BookingArtifact; onAction?: (text: string) => void }) {
  return (
    <div
      onClick={() => scrollToToolCall(booking.toolCallId)}
      className="cursor-pointer rounded-xl border border-neutral-200 bg-white p-3 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/50"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">{booking.title}</span>
        <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          Booked
        </span>
      </div>
      <p className="mt-1 text-xs text-neutral-500">
        {booking.contactName} · {booking.date} {booking.time}
      </p>
      {onAction && (
        <div className="mt-2 flex gap-1.5">
          <ActionButton label="Send reminder" onClick={() => onAction(`Send a reminder to ${booking.contactName} about the ${booking.title} on ${booking.date}`)} />
          <ActionButton label="Cancel" onClick={() => onAction(`Cancel the ${booking.title} with ${booking.contactName}`)} />
        </div>
      )}
    </div>
  );
}

function PaymentCard({ payment }: { payment: PaymentArtifact }) {
  return (
    <div
      onClick={() => scrollToToolCall(payment.toolCallId)}
      className="cursor-pointer rounded-xl border border-emerald-200 bg-white p-3 transition-colors hover:bg-neutral-50 dark:border-emerald-800/40 dark:bg-neutral-900 dark:hover:bg-neutral-800/50"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-500 dark:text-neutral-400">{payment.invoiceNumber}</span>
        <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          Paid
        </span>
      </div>
      <div className="mt-1 flex items-baseline justify-between">
        <span className="text-xs text-neutral-500">{payment.contactName}</span>
        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          {formatCurrency(payment.amount)}
        </span>
      </div>
    </div>
  );
}

// ── Queue tracker ──

const queueStatusIcon: Record<QueueItem['status'], React.ReactNode> = {
  pending: <div className="size-2 rounded-full bg-neutral-300 dark:bg-neutral-600" />,
  current: <div className="size-3 rounded-full border-2 border-neutral-900 dark:border-neutral-100" />,
  drafted: (
    <div className="flex size-4 items-center justify-center rounded-full bg-blue-500">
      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>
    </div>
  ),
  sent: (
    <div className="flex size-4 items-center justify-center rounded-full bg-emerald-500">
      <CheckIcon className="size-2.5 text-white" />
    </div>
  ),
  skipped: (
    <div className="flex size-4 items-center justify-center rounded-full bg-neutral-300 dark:bg-neutral-600">
      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m13 5 7 7-7 7" /><path d="M6 5l7 7-7 7" /></svg>
    </div>
  ),
};

const queueStatusLabel: Record<QueueItem['status'], string> = {
  pending: '',
  current: 'Current',
  drafted: 'Drafted',
  sent: 'Sent',
  skipped: 'Skipped',
};

function QueueTracker({ items, onJump }: { items: QueueItem[]; onJump: (item: QueueItem) => void }) {
  if (items.length === 0) return null;

  const completed = items.filter((i) => i.status === 'sent' || i.status === 'skipped').length;

  return (
    <Section title="Queue" defaultOpen count={items.length}>
      <div className="mb-2 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
          <div
            className="h-full rounded-full bg-neutral-900 transition-all duration-300 dark:bg-neutral-100"
            style={{ width: `${(completed / items.length) * 100}%` }}
          />
        </div>
        <span className="shrink-0 text-[10px] tabular-nums text-neutral-400">
          {completed}/{items.length}
        </span>
      </div>
      <div className="flex flex-col">
        {items.map((item) => {
          const isClickable = item.status !== 'current';
          return (
            <button
              key={item.index}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && onJump(item)}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors',
                item.status === 'current' && 'bg-neutral-100 dark:bg-neutral-800/50',
                isClickable && 'cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800/50',
              )}
            >
              <div className="flex w-4 shrink-0 items-center justify-center">
                {queueStatusIcon[item.status]}
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn(
                  'truncate text-xs',
                  item.status === 'current'
                    ? 'font-medium text-neutral-900 dark:text-neutral-100'
                    : item.status === 'sent' || item.status === 'skipped'
                      ? 'text-neutral-400 dark:text-neutral-500'
                      : 'text-neutral-600 dark:text-neutral-400',
                )}>
                  {item.label}
                </p>
              </div>
              {queueStatusLabel[item.status] && (
                <span className={cn(
                  'shrink-0 text-[10px]',
                  item.status === 'sent' ? 'text-emerald-500' :
                  item.status === 'drafted' ? 'text-blue-500' :
                  item.status === 'current' ? 'text-neutral-500' :
                  'text-neutral-400',
                )}>
                  {queueStatusLabel[item.status]}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </Section>
  );
}

// ── Context sections ──

function DashboardCardSection({ context }: { context: Extract<ArtifactContext, { type: 'dashboard-card' }> }) {
  const lines = context.summary.split('\n').filter(Boolean);
  return (
    <Section title={context.title} defaultOpen>
      <div className="flex flex-col gap-1">
        {lines.map((line, i) => (
          <p key={i} className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
            {line}
          </p>
        ))}
      </div>
    </Section>
  );
}

function ReviewItemSection({ context }: { context: Extract<ArtifactContext, { type: 'review-item' }> }) {
  return (
    <Section title="Review" defaultOpen>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">{context.agentName}</span>
          <span className={cn(
            'rounded px-1 py-px text-[10px] font-medium',
            context.status === 'failed'
              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
          )}>
            {context.status === 'failed' ? 'Failed' : 'Pending'}
          </span>
        </div>
        <p className="text-xs font-medium text-neutral-800 dark:text-neutral-200">{context.description}</p>
        {context.detail && (
          <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">{context.detail}</p>
        )}
      </div>
    </Section>
  );
}

// ── Main sidebar ──

type ChatContextSidebarProps = {
  artifactContext?: ArtifactContext;
  contactContext?: ContactContext;
  messages: UIMessage[];
  isStreaming: boolean;
  onSendMessage?: (text: string) => void;
};

export function ChatContextSidebar({ artifactContext, contactContext, messages, isStreaming, onSendMessage }: ChatContextSidebarProps) {
  const { invoices, messageDrafts, invoicePrevVersions, draftPrevVersions, bookings, payments, toolNames, queueItems } = useMemo(() => {
    const outputs = extractToolOutputs(messages);
    return { ...outputs, queueItems: extractQueueItems(messages, outputs.messageDrafts) };
  }, [messages]);
  const steps = useMemo(
    () => deriveAgentSteps(messages, toolNames, isStreaming),
    [messages, toolNames, isStreaming],
  );
  const actionCount = invoices.length + messageDrafts.length + bookings.length + payments.length;

  const handleJump = (item: QueueItem) => {
    if (onSendMessage) {
      onSendMessage(`Jump to #${item.index}: ${item.label}`);
    }
  };

  return (
    <div className="flex h-full w-80 shrink-0 flex-col border-l border-neutral-200/60 bg-neutral-50/50 dark:border-neutral-800/60 dark:bg-neutral-950/50">
      <div className="flex-1 overflow-y-auto">
        {/* Queue tracker */}
        {queueItems.length > 0 && (
          <QueueTracker items={queueItems} onJump={handleJump} />
        )}

        {/* Progress */}
        <Section title="Progress" defaultOpen={queueItems.length === 0}>
          <ProgressSteps steps={steps} />
        </Section>

        {/* Contact */}
        {contactContext && (
          <Section title="Contact" defaultOpen>
            <ContactCard contact={contactContext} />
          </Section>
        )}

        {/* Artifact context */}
        {artifactContext && artifactContext.type === 'dashboard-card' && (
          <DashboardCardSection context={artifactContext} />
        )}
        {artifactContext && artifactContext.type === 'review-item' && (
          <ReviewItemSection context={artifactContext} />
        )}

        {/* Actions taken */}
        <Section title="Actions" defaultOpen count={actionCount > 0 ? actionCount : undefined}>
          {actionCount === 0 ? (
            <p className="text-xs text-neutral-400 dark:text-neutral-500">
              Invoices, messages, and bookings created in this chat will appear here.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {invoices.map((inv) => (
                <InvoiceCard key={inv.id} invoice={inv} onAction={onSendMessage} prevVersions={invoicePrevVersions.get(inv.id) ?? []} />
              ))}
              {messageDrafts.map((msg) => (
                <MessageDraftCard key={msg.id} draft={msg} onAction={onSendMessage} prevVersions={draftPrevVersions.get(msg.id) ?? []} />
              ))}
              {bookings.map((b) => (
                <BookingCard key={b.id} booking={b} onAction={onSendMessage} />
              ))}
              {payments.map((p) => (
                <PaymentCard key={p.id} payment={p} />
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
