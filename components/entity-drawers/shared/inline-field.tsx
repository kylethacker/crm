'use client';

import { type ComponentPropsWithRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

type InlineFieldProps = ComponentPropsWithRef<'div'> & {
  label: string;
  icon?: ReactNode;
  error?: string;
};

/**
 * A single row in an entity drawer: icon + label on the left, editable value on the right.
 * Mirrors the Attio-style layout where view and edit are the same surface.
 */
export function InlineField({
  label,
  icon,
  error,
  className,
  children,
  ...props
}: InlineFieldProps) {
  return (
    <div className={cn('group', className)} {...props}>
      <div className="flex min-h-9 items-center gap-3">
        <div className="flex w-36 shrink-0 items-center gap-2">
          {icon ? (
            <span className="flex size-4 shrink-0 items-center justify-center text-neutral-400 dark:text-neutral-500">
              {icon}
            </span>
          ) : null}
          <span className="text-sm text-neutral-500 dark:text-neutral-400">{label}</span>
        </div>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      {error ? <p className="mt-1 pl-[calc(--spacing(36)+(--spacing(5)))] text-xs text-red-500">{error}</p> : null}
    </div>
  );
}

const inlineInputBase = [
  'w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-sm text-neutral-900',
  'outline-none transition-colors',
  'placeholder:text-neutral-400',
  'hover:border-neutral-200 hover:bg-neutral-50',
  'focus:border-neutral-300 focus:bg-white focus:ring-1 focus:ring-neutral-200',
  'dark:text-neutral-100',
  'dark:hover:border-neutral-700 dark:hover:bg-neutral-800/50',
  'dark:focus:border-neutral-600 dark:focus:bg-neutral-900 dark:focus:ring-neutral-700',
] as const;

export function InlineInput({
  className,
  ref,
  ...props
}: ComponentPropsWithRef<'input'>) {
  return (
    <input
      ref={ref}
      className={cn(...inlineInputBase, className)}
      {...props}
    />
  );
}

export function InlineSelect({
  className,
  ref,
  ...props
}: ComponentPropsWithRef<'select'>) {
  return (
    <select
      ref={ref}
      className={cn(
        ...inlineInputBase,
        'cursor-pointer appearance-none bg-size-[16px] bg-position-[right_4px_center] bg-no-repeat pr-6',
        "bg-[url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")]",
        className,
      )}
      {...props}
    />
  );
}

export function InlineTextarea({
  className,
  ref,
  ...props
}: ComponentPropsWithRef<'textarea'>) {
  return (
    <textarea
      ref={ref}
      className={cn(
        ...inlineInputBase,
        'min-h-16 resize-y',
        className,
      )}
      {...props}
    />
  );
}
