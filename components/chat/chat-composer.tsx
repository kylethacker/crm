'use client';

import { useRef, type ReactNode } from 'react';
import { ArrowUpIcon, StopIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

type ChatComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  isPending?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  rows?: number;
  maxHeight?: number;
  footer?: ReactNode;
  className?: string;
};

export function ChatComposer({
  value,
  onChange,
  onSubmit,
  onStop,
  isPending,
  placeholder,
  autoFocus,
  rows = 1,
  maxHeight = 200,
  footer,
  className,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || isPending) return;
    onSubmit();
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950',
        className,
      )}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={rows}
        className="block w-full resize-none bg-transparent px-4 pt-3 pb-2 text-sm leading-relaxed outline-none placeholder:text-neutral-400 dark:text-white"
      />
      <div className="flex items-center justify-between px-3 pb-2.5">
        <div className="min-w-0 flex-1">{footer}</div>
        {isPending && onStop ? (
          <button
            type="button"
            onClick={onStop}
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white transition-colors hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            <StopIcon />
            <span className="sr-only">Stop</span>
          </button>
        ) : (
          <button
            type="submit"
            disabled={!value.trim()}
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white transition-colors hover:bg-neutral-700 disabled:cursor-default disabled:opacity-30 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
          >
            <ArrowUpIcon />
            <span className="sr-only">Send</span>
          </button>
        )}
      </div>
    </form>
  );
}
