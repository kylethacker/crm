'use client';

import { useState, useMemo } from 'react';
import type { UIMessage } from 'ai';
import { cn } from '@/lib/utils';
import { CheckIcon } from '@/components/icons';
import type { ArtifactContext, ContactContext } from '@/lib/chat/chat-history';

// ── Types ──

type InvoiceArtifact = {
  id: string;
  invoiceNumber: string;
  contactName: string;
  total: number;
  status: string;
  dueDate: string;
  items: { description: string; amount: number }[];
};

type MessageDraft = {
  id: string;
  contactName: string;
  text: string;
  status: string;
};

type BookingArtifact = {
  id: string;
  contactName: string;
  title: string;
  date: string;
  time: string;
  status: string;
};

type PaymentArtifact = {
  id: string;
  contactName: string;
  amount: number;
  invoiceNumber: string;
};

type AgentStep = {
  id: string;
  label: string;
  status: 'done' | 'active' | 'pending';
};

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
      const toolName = part.type === 'dynamic-tool' ? part.toolName : part.type.replace(/^tool-/, '');
      toolNames.push(toolName);

      if (toolName === 'createInvoice') {
        invoices.push(part.output as InvoiceArtifact);
      } else if (toolName === 'draftMessage') {
        messageDrafts.push(part.output as MessageDraft);
      } else if (toolName === 'sendInvoice') {
        sentInvoiceIds.add((part.output as { invoiceId: string }).invoiceId);
      } else if (toolName === 'sendMessage') {
        sentMessageIds.add((part.output as { messageId: string }).messageId);
      } else if (toolName === 'createBooking') {
        bookings.push(part.output as BookingArtifact);
      } else if (toolName === 'recordPayment') {
        payments.push(part.output as PaymentArtifact);
      }
    }
  }

  return {
    invoices: invoices.map((inv) => ({
      ...inv,
      status: sentInvoiceIds.has(inv.id) ? 'sent' : inv.status,
    })),
    messageDrafts: messageDrafts.map((msg) => ({
      ...msg,
      status: sentMessageIds.has(msg.id) ? 'sent' : msg.status,
    })),
    bookings,
    payments,
    toolNames,
  };
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
  const initials = contact.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

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

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function InvoiceCard({ invoice }: { invoice: InvoiceArtifact }) {
  const isSent = invoice.status === 'sent';
  return (
    <div className={cn(
      'rounded-xl border bg-white p-3 dark:bg-neutral-900',
      isSent
        ? 'border-emerald-200 dark:border-emerald-800/40'
        : 'border-neutral-200 dark:border-neutral-800',
    )}>
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
    </div>
  );
}

function MessageDraftCard({ draft }: { draft: MessageDraft }) {
  const isSent = draft.status === 'sent';
  return (
    <div className={cn(
      'rounded-xl border bg-white p-3 dark:bg-neutral-900',
      isSent
        ? 'border-emerald-200 dark:border-emerald-800/40'
        : 'border-neutral-200 dark:border-neutral-800',
    )}>
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
    </div>
  );
}

function BookingCard({ booking }: { booking: BookingArtifact }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100">{booking.title}</span>
        <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          Booked
        </span>
      </div>
      <p className="mt-1 text-xs text-neutral-500">
        {booking.contactName} · {booking.date} {booking.time}
      </p>
    </div>
  );
}

function PaymentCard({ payment }: { payment: PaymentArtifact }) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-white p-3 dark:border-emerald-800/40 dark:bg-neutral-900">
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
};

export function ChatContextSidebar({ artifactContext, contactContext, messages, isStreaming }: ChatContextSidebarProps) {
  const { invoices, messageDrafts, bookings, payments, toolNames } = useMemo(
    () => extractToolOutputs(messages),
    [messages],
  );
  const steps = useMemo(
    () => deriveAgentSteps(messages, toolNames, isStreaming),
    [messages, toolNames, isStreaming],
  );
  const actionCount = invoices.length + messageDrafts.length + bookings.length + payments.length;

  return (
    <div className="flex h-full w-80 shrink-0 flex-col border-l border-neutral-200/60 bg-neutral-50/50 dark:border-neutral-800/60 dark:bg-neutral-950/50">
      <div className="flex-1 overflow-y-auto">
        {/* Progress */}
        <Section title="Progress" defaultOpen>
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
                <InvoiceCard key={inv.id} invoice={inv} />
              ))}
              {messageDrafts.map((msg) => (
                <MessageDraftCard key={msg.id} draft={msg} />
              ))}
              {bookings.map((b) => (
                <BookingCard key={b.id} booking={b} />
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
