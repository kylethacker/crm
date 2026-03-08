import { type ComponentPropsWithRef } from 'react';
import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { cn } from '@/lib/utils';

// ── Re-export primitives you use unchanged ────────────────────────────────────

export const Dialog = BaseDialog.Root;
export const DialogTrigger = BaseDialog.Trigger;
export const DialogClose = BaseDialog.Close;

// ── Styled wrappers ───────────────────────────────────────────────────────────

export function DialogBackdrop({
  className,
  ref,
  ...props
}: ComponentPropsWithRef<typeof BaseDialog.Backdrop>) {
  return (
    <BaseDialog.Backdrop
      ref={ref}
      className={cn(
        'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm',
        'transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0',
        className,
      )}
      {...props}
    />
  );
}

export function DialogPopup({
  className,
  ref,
  ...props
}: ComponentPropsWithRef<typeof BaseDialog.Popup>) {
  return (
    <BaseDialog.Popup
      ref={ref}
      className={cn(
        'fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
        'rounded-xl border border-neutral-200 bg-white p-6 shadow-xl',
        'dark:border-neutral-800 dark:bg-neutral-900',
        'transition-[opacity,transform]',
        'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
        'data-[ending-style]:scale-95 data-[ending-style]:opacity-0',
        className,
      )}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ref,
  ...props
}: ComponentPropsWithRef<typeof BaseDialog.Title>) {
  return (
    <BaseDialog.Title
      ref={ref}
      className={cn('text-lg font-semibold text-neutral-950 dark:text-neutral-50', className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ref,
  ...props
}: ComponentPropsWithRef<typeof BaseDialog.Description>) {
  return (
    <BaseDialog.Description
      ref={ref}
      className={cn('mt-1 text-sm text-neutral-500 dark:text-neutral-400', className)}
      {...props}
    />
  );
}
