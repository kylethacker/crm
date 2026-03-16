import { type ComponentPropsWithRef } from 'react';
import { Popover as BasePopover } from '@base-ui/react/popover';
import { cn } from '@/lib/utils';

export const Popover = BasePopover.Root;
export const PopoverTrigger = BasePopover.Trigger;
export const PopoverClose = BasePopover.Close;
export const PopoverArrow = BasePopover.Arrow;

export function PopoverPositioner({
  className,
  ref,
  ...props
}: ComponentPropsWithRef<typeof BasePopover.Positioner>) {
  return (
    <BasePopover.Portal>
      <BasePopover.Positioner ref={ref} className={cn('z-50', className)} {...props} />
    </BasePopover.Portal>
  );
}

export function PopoverPopup({
  className,
  ref,
  ...props
}: ComponentPropsWithRef<typeof BasePopover.Popup>) {
  return (
    <BasePopover.Popup
      ref={ref}
      className={cn(
        'min-w-[180px] rounded-xl border border-neutral-200 bg-white p-1.5 shadow-lg',
        'dark:border-neutral-800 dark:bg-neutral-900',
        'origin-(--transform-origin)',
        'transition-[opacity,transform] data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0',
        className,
      )}
      {...props}
    />
  );
}
