'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckIcon, ErrorIcon } from '@/components/icons';
import { type ToolPart, getToolName } from '@/lib/chat/suggested-responses';
import { useViews } from '@/lib/views/context';
import type { TableViewType } from '@/lib/views/types';
import { ToolRenderer, hasToolRenderer } from './tool-renderers';

export type { ToolPart };

const tableToolToViewType: Record<string, TableViewType> = {
  getContacts: 'contacts',
  getInvoices: 'invoices',
  getQuotes: 'quotes',
};

const defaultViewNames: Record<TableViewType, string> = {
  contacts: 'Contacts',
  invoices: 'Invoices',
  quotes: 'Quotes',
};

function buildViewName(viewType: TableViewType, filters: Record<string, unknown>): string {
  const base = defaultViewNames[viewType];
  if (filters.status) return `${String(filters.status).charAt(0).toUpperCase() + String(filters.status).slice(1)} ${base}`;
  if (filters.contactName) return `${base} — ${filters.contactName}`;
  if (filters.overdueOnly) return `Overdue ${base}`;
  return base;
}

export function ToolInvocation({ part }: { part: ToolPart }) {
  const toolName = getToolName(part);
  const isDone = part.state === 'output-available';
  const isError = part.state === 'output-error';
  const isDenied = part.state === 'output-denied';
  const output = isDone ? part.output : undefined;

  const hasRichRender = isDone && output != null && hasToolRenderer(toolName);
  const viewType = tableToolToViewType[toolName];
  const canSaveAsView = isDone && output != null && viewType != null && Array.isArray(output) && output.length > 0;

  return (
    <div data-tool-call-id={part.toolCallId} className="overflow-hidden rounded-lg border border-neutral-200 text-xs transition-shadow duration-500 dark:border-neutral-800">
      <ToolHeader
        toolName={toolName}
        isDone={isDone}
        isError={isError}
        isDenied={isDenied}
      />

      {isError && part.errorText && (
        <div className="border-t border-neutral-200 bg-neutral-100 px-3 py-2 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-400">
          {part.errorText}
        </div>
      )}

      {hasRichRender && (
        <div className="border-t border-neutral-200 dark:border-neutral-800">
          <ToolRenderer name={toolName} output={output} />
        </div>
      )}

      {isDone && output != null && !hasRichRender && (
        <ToolOutputFallback output={output} />
      )}

      {canSaveAsView && (
        <SaveAsViewButton
          viewType={viewType}
          args={'args' in part ? (part.args as Record<string, unknown>) : {}}
        />
      )}
    </div>
  );
}

function SaveAsViewButton({ viewType, args }: { viewType: TableViewType; args: Record<string, unknown> }) {
  const router = useRouter();
  const { addView } = useViews();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const { limit: _limit, ...filters } = args;
    const name = buildViewName(viewType, filters);
    const view = addView(viewType, name, filters);
    setSaved(true);
    router.push(`/views/${view.id}`);
  };

  return (
    <div className="border-t border-neutral-200 dark:border-neutral-800">
      <button
        type="button"
        disabled={saved}
        onClick={handleSave}
        className="flex w-full cursor-pointer items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-700 disabled:cursor-default disabled:opacity-50 dark:hover:bg-neutral-900 dark:hover:text-neutral-300"
      >
        {saved ? (
          <>
            <CheckIcon className="text-green-600 dark:text-green-400" />
            Saved to views
          </>
        ) : (
          <>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 2v20M2 12h20" />
            </svg>
            Save as view
          </>
        )}
      </button>
    </div>
  );
}

function ToolHeader({
  toolName,
  isDone,
  isError,
  isDenied,
}: {
  toolName: string;
  isDone: boolean;
  isError: boolean;
  isDenied: boolean;
}) {
  return (
    <div className="flex items-center gap-2 bg-neutral-50 px-3 py-2 font-medium text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
      {isError || isDenied ? (
        <ErrorIcon className="text-neutral-600 dark:text-neutral-400" />
      ) : isDone ? (
        <CheckIcon className="text-neutral-600 dark:text-neutral-400" />
      ) : (
        <span className="inline-block size-3 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600 dark:border-neutral-600 dark:border-t-neutral-300" />
      )}
      <span>{formatToolName(toolName)}</span>
    </div>
  );
}

function ToolOutputFallback({ output }: { output: unknown }) {
  const [expanded, setExpanded] = useState(false);

  if (output == null) return null;

  const isObject = typeof output === 'object' && !Array.isArray(output);
  const entries = isObject ? Object.entries(output as Record<string, unknown>) : null;

  if (entries && entries.length > 0) {
    const preview = entries.slice(0, 3);
    const hasMore = entries.length > 3;
    const visible = expanded ? entries : preview;

    return (
      <div className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <dl className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
          {visible.map(([key, value]) => (
            <div key={key} className="flex items-baseline justify-between gap-4 px-3 py-1.5">
              <dt className="shrink-0 text-neutral-500 dark:text-neutral-400">
                {formatKey(key)}
              </dt>
              <dd className="truncate text-right font-medium text-neutral-900 dark:text-neutral-100">
                {formatValue(value)}
              </dd>
            </div>
          ))}
        </dl>
        {hasMore && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="w-full cursor-pointer border-t border-neutral-100 px-3 py-1.5 text-center text-neutral-500 transition-colors hover:text-neutral-700 dark:border-neutral-800/60 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            {expanded ? 'Show less' : `Show ${entries.length - 3} more`}
          </button>
        )}
      </div>
    );
  }

  return (
    <pre className="border-t border-neutral-200 bg-white p-3 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300">
      {typeof output === 'string' ? output : JSON.stringify(output, null, 2)}
    </pre>
  );
}

function formatToolName(name: string) {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function formatKey(key: string) {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function formatValue(value: unknown): string {
  if (value == null) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return value.toLocaleString();
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}
