import { type ComponentPropsWithRef, type ReactNode } from 'react';
import { Drawer } from '@base-ui/react/drawer';
import { cn } from '@/lib/utils';

export const DrawerRoot = Drawer.Root;
export const DrawerPortal = Drawer.Portal;
export const DrawerClose = Drawer.Close;

export function DrawerBackdrop({
  className,
  ref,
  ...props
}: ComponentPropsWithRef<typeof Drawer.Backdrop>) {
  return (
    <Drawer.Backdrop
      ref={ref}
      className={cn(
        'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm',
        'transition-opacity',
        'data-starting-style:opacity-0 data-ending-style:opacity-0',
        className,
      )}
      style={{
        opacity: 'calc(0.4 * (1 - var(--drawer-swipe-progress, 0)))',
      }}
      {...props}
    />
  );
}

export function DrawerViewport({
  className,
  ref,
  ...props
}: ComponentPropsWithRef<typeof Drawer.Viewport>) {
  return <Drawer.Viewport ref={ref} className={cn('fixed inset-0 z-50', className)} {...props} />;
}

export function DrawerPopup({
  className,
  ref,
  ...props
}: ComponentPropsWithRef<typeof Drawer.Popup>) {
  return (
    <Drawer.Popup
      ref={ref}
      className={cn(
        'fixed inset-y-0 right-0 flex h-full w-full max-w-lg flex-col border-l border-neutral-200 bg-white shadow-xl',
        'dark:border-neutral-800 dark:bg-neutral-900',
        'transition-transform',
        'data-starting-style:translate-x-full data-ending-style:translate-x-full',
        className,
      )}
      style={{
        transform: 'translateX(var(--drawer-swipe-movement-x, 0px))',
      }}
      {...props}
    />
  );
}

export function DrawerContent({
  className,
  ref,
  ...props
}: ComponentPropsWithRef<typeof Drawer.Content>) {
  return (
    <Drawer.Content
      ref={ref}
      className={cn('flex h-full min-h-0 flex-col', className)}
      {...props}
    />
  );
}

export function DrawerHeader({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
      <div className="min-w-0 flex-1">
        <Drawer.Title className="truncate text-base font-semibold text-neutral-900 dark:text-neutral-100">
          {title}
        </Drawer.Title>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {children}
        <Drawer.Close
          type="button"
          className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          aria-label="Close panel"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </Drawer.Close>
      </div>
    </div>
  );
}

export function DrawerBody({
  className,
  ...props
}: ComponentPropsWithRef<'div'>) {
  return (
    <div
      className={cn('min-h-0 flex-1 overflow-y-auto', className)}
      data-base-ui-swipe-ignore=""
      {...props}
    />
  );
}

export function DrawerFooter({
  className,
  ...props
}: ComponentPropsWithRef<'div'>) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-end gap-2 border-t border-neutral-200 px-4 py-3 dark:border-neutral-800',
        className,
      )}
      {...props}
    />
  );
}
