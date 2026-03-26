'use client';
/* eslint-disable react-hooks/static-components -- dynamic renderer registry uses stable module-level lazy refs */

import { lazy, Suspense, type ComponentType } from 'react';
import type { AppTools } from '@/lib/ai/tools';

type ToolName = keyof AppTools;

type RendererProps = { data: unknown };

type LazyLoader = () => Promise<{ default: ComponentType<RendererProps> }>;

const rendererLoaders: Partial<Record<ToolName, LazyLoader>> = {
  createInvoice: () => import('./create-invoice').then((m) => ({ default: m.CreateInvoiceResult as ComponentType<RendererProps> })),
  draftMessage: () => import('./draft-message').then((m) => ({ default: m.DraftMessageResult as ComponentType<RendererProps> })),
  getContacts: () => import('./get-contacts').then((m) => ({ default: m.GetContactsResult as ComponentType<RendererProps> })),
  getInvoices: () => import('./get-invoices').then((m) => ({ default: m.GetInvoicesResult as ComponentType<RendererProps> })),
  getQuotes: () => import('./get-quotes').then((m) => ({ default: m.GetQuotesResult as ComponentType<RendererProps> })),
  sendInvoice: () => import('./send-invoice').then((m) => ({ default: m.SendInvoiceResult as ComponentType<RendererProps> })),
  sendMessage: () => import('./send-message').then((m) => ({ default: m.SendMessageResult as ComponentType<RendererProps> })),
  getContactSummary: () => import('./get-contact-summary').then((m) => ({ default: m.GetContactSummaryResult as ComponentType<RendererProps> })),
  getTodaySchedule: () => import('./get-today-schedule').then((m) => ({ default: m.GetTodayScheduleResult as ComponentType<RendererProps> })),
  generateDesign: () => import('./generate-design').then((m) => ({ default: m.GenerateDesignResult as ComponentType<RendererProps> })),
  hireAgent: () => import('./hire-agent').then((m) => ({ default: m.HireAgentResult as ComponentType<RendererProps> })),
};

// Pre-create lazy components at module scope so they are stable across renders.
// This satisfies the React Compiler rule against creating components during render.
const renderers = new Map<string, ComponentType<RendererProps>>();
for (const [name, loader] of Object.entries(rendererLoaders)) {
  renderers.set(name, lazy(loader));
}

export function hasToolRenderer(name: string): boolean {
  return renderers.has(name);
}

export function ToolRenderer({ name, output }: { name: string; output: unknown }) {
  const Component = renderers.get(name);
  if (!Component) return null;

  return (
    <Suspense
      fallback={
        <div className="animate-pulse px-3 py-2 text-xs text-neutral-400">
          Loading…
        </div>
      }
    >
      <Component data={output} />
    </Suspense>
  );
}
