import { type ComponentPropsWithRef } from 'react';
import { Button as BaseButton } from '@base-ui/react/button';
import { cn } from '@/lib/utils';

// ── Variants ──────────────────────────────────────────────────────────────────

const variants = {
  solid:
    'bg-neutral-900 text-white hover:bg-neutral-700 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200',
  outline:
    'border border-neutral-300 bg-transparent text-neutral-900 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-800',
  ghost:
    'bg-transparent text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800',
  destructive:
    'bg-red-600 text-white hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-400',
} as const;

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-9 px-4 text-sm',
  lg: 'h-10 px-5 text-sm',
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

// ── Props ─────────────────────────────────────────────────────────────────────

type ButtonProps = ComponentPropsWithRef<typeof BaseButton> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Button built on Base UI's accessible, headless <Button> primitive.
 *
 * @example
 * <Button variant="solid" size="md" onClick={…}>Save</Button>
 * <Button variant="outline" disabled>Loading…</Button>
 */
export function Button({ className, variant = 'solid', size = 'md', ref, ...props }: ButtonProps) {
  return (
    <BaseButton
      ref={ref}
      className={cn(
        'inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg font-medium',
        'transition-colors duration-150 outline-none',
        'focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 dark:focus-visible:ring-neutral-600',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
