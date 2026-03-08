import { type ComponentPropsWithRef } from 'react';
import { cn } from '@/lib/utils';

type InputProps = ComponentPropsWithRef<'input'>;

export function Input({ className, ref, ...props }: InputProps) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm',
        'outline-none transition-colors placeholder:text-neutral-400',
        'focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'dark:border-neutral-700 dark:bg-neutral-900 dark:text-white',
        'dark:focus:border-neutral-500 dark:focus:ring-neutral-800',
        className,
      )}
      {...props}
    />
  );
}
