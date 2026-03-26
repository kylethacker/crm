import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type DrawerSectionProps = ComponentPropsWithRef<'section'> & {
  title?: string;
  description?: ReactNode;
  contentClassName?: string;
};

export function DrawerSection({
  title,
  description,
  className,
  contentClassName,
  children,
  ...props
}: DrawerSectionProps) {
  return (
    <section
      className={cn(
        'rounded-xl border border-neutral-200 bg-neutral-50/60 dark:border-neutral-800 dark:bg-neutral-950/40',
        className,
      )}
      {...props}
    >
      {(title || description) ? (
        <header className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
          {title ? (
            <h3 className="text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400">
              {title}
            </h3>
          ) : null}
          {description ? (
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{description}</p>
          ) : null}
        </header>
      ) : null}
      <div className={cn('px-4 py-4', contentClassName)}>{children}</div>
    </section>
  );
}
