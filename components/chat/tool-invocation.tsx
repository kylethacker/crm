'use client';

import { useState } from 'react';
import type { UIMessage } from 'ai';
import { CheckIcon, ErrorIcon } from '@/components/icons';
import { ToolRenderer, hasToolRenderer } from './tool-renderers';

export type ToolPart = Extract<UIMessage['parts'][number], { toolCallId: string }>;

export function ToolInvocation({ part }: { part: ToolPart }) {
  const toolName = part.type === 'dynamic-tool' ? part.toolName : part.type.replace(/^tool-/, '');
  const isDone = part.state === 'output-available';
  const isError = part.state === 'output-error';
  const isDenied = part.state === 'output-denied';
  const output = isDone ? part.output : undefined;

  const hasRichRender = isDone && output != null && hasToolRenderer(toolName);

  return (
    <div className="overflow-hidden rounded-lg border border-neutral-200 text-xs dark:border-neutral-800">
      <ToolHeader
        toolName={toolName}
        isDone={isDone}
        isError={isError}
        isDenied={isDenied}
      />

      {isError && part.errorText && (
        <div className="border-t border-neutral-200 bg-red-50 px-3 py-2 text-red-600 dark:border-neutral-800 dark:bg-red-950/30 dark:text-red-400">
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
        <ErrorIcon className="text-red-600 dark:text-red-400" />
      ) : isDone ? (
        <CheckIcon className="text-green-600 dark:text-green-400" />
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
