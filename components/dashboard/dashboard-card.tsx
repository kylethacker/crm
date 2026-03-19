'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useChatHistory } from '@/lib/chat/chat-history-context';
import type { ContactContext, DashboardCardContext } from '@/lib/chat/chat-history';

type BaseDashboardCardProps = {
  title: string;
  chatContext?: Omit<DashboardCardContext, 'type'>;
  chatContactContext?: ContactContext;
  className?: string;
};

type SimpleCardProps = BaseDashboardCardProps & {
  description?: string;
  value: string;
  cta?: string;
  children?: never;
  subtitle?: never;
  insight?: never;
  badge?: never;
  actions?: never;
};

type LegacyCardProps = BaseDashboardCardProps & {
  subtitle?: string;
  insight?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  description?: never;
  value?: never;
  cta?: never;
};

type DashboardCardProps = SimpleCardProps | LegacyCardProps;

export function DashboardCard(props: DashboardCardProps) {
  const { title, chatContext, chatContactContext, className } = props;
  const router = useRouter();
  const { createSession, findSessionByArtifact, selectSession } = useChatHistory();

  const handleChat = () => {
    if (!chatContext) return;
    const existing = findSessionByArtifact(chatContext.sourceId);
    if (existing) {
      selectSession(existing.id);
    } else {
      createSession({
        artifactContext: { type: 'dashboard-card', ...chatContext },
        ...(chatContactContext && { contactContext: chatContactContext }),
      });
    }
    router.push('/chat');
  };

  // Legacy card with children — discriminate by checking `value` (required in simple, never in legacy)
  if (!('value' in props) || props.value === undefined) {
    const legacyProps = props as LegacyCardProps;
    return (
      <div className={cn('flex h-full flex-col overflow-hidden rounded-2xl bg-black/3 dark:bg-white/4', className)}>
        <div className="flex items-center gap-2 px-6 pt-5 pb-1">
          <div className="flex min-w-0 flex-1 items-baseline gap-1.5">
            {legacyProps.badge}
            <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {title}
            </h3>
            {legacyProps.subtitle && (
              <>
                <span className="text-black/20 dark:text-white/20">·</span>
                <span className="truncate text-sm text-black/55 dark:text-white/45">{legacyProps.subtitle}</span>
              </>
            )}
          </div>
          {legacyProps.actions}
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-auto px-6 pt-2">{legacyProps.children}</div>
        {chatContext && (
          <div className="flex items-center gap-2 px-6 pb-5 pt-2">
            <button
              type="button"
              onClick={handleChat}
              className="cursor-pointer rounded-xl bg-white px-3 py-1 text-sm font-medium text-black/55 shadow-[0_4px_4px_rgba(0,0,0,0.05),0_0_0_1px_rgba(0,0,0,0.1)] transition-colors hover:bg-neutral-100 dark:bg-neutral-800 dark:text-white/55 dark:shadow-[0_4px_4px_rgba(0,0,0,0.2),0_0_0_1px_rgba(255,255,255,0.08)] dark:hover:bg-neutral-700"
            >
              Chat
            </button>
          </div>
        )}
        {!chatContext && <div className="pb-5" />}
      </div>
    );
  }

  // Simple card (new style)
  const { description, value, cta } = props;

  return (
    <button
      type="button"
      onClick={handleChat}
      className={cn(
        'flex h-full min-h-[160px] cursor-pointer flex-col rounded-xl border border-neutral-200 bg-white px-5 py-4 text-left transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/70',
        className,
      )}
    >
      <h3 className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
        {title}
      </h3>
      {description && (
        <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
          {description}
        </p>
      )}
      <p className="mt-auto text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        {value}
      </p>
      {cta && (
        <span className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500">
          {cta}
        </span>
      )}
    </button>
  );
}
