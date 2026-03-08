import { type ComponentPropsWithRef } from 'react';
import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import { cn } from '@/lib/utils';

// ── Re-export primitives you use unchanged ────────────────────────────────────

export const TooltipProvider = BaseTooltip.Provider;
export const Tooltip = BaseTooltip.Root;
export const TooltipTrigger = BaseTooltip.Trigger;

// ── Styled wrappers ───────────────────────────────────────────────────────────

export const TooltipPositioner = BaseTooltip.Positioner;

export function TooltipPopup({
  className,
  ref,
  ...props
}: ComponentPropsWithRef<typeof BaseTooltip.Popup>) {
  return (
    <BaseTooltip.Popup
      ref={ref}
      className={cn(
        'z-50 rounded-md border border-neutral-200 bg-neutral-900 px-2.5 py-1.5 text-xs text-white shadow-sm',
        'dark:border-neutral-700 dark:bg-white dark:text-neutral-900',
        'transition-[opacity,transform]',
        'data-[starting-style]:scale-95 data-[starting-style]:opacity-0',
        'data-[ending-style]:scale-95 data-[ending-style]:opacity-0',
        className,
      )}
      {...props}
    />
  );
}

export function TooltipArrow({
  className,
  ref,
  ...props
}: ComponentPropsWithRef<typeof BaseTooltip.Arrow>) {
  return (
    <BaseTooltip.Arrow
      ref={ref}
      className={cn('data-[side=bottom]:top-[-5px] data-[side=top]:bottom-[-5px]', className)}
      {...props}
    />
  );
}
