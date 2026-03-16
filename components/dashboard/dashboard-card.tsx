'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useChatHistory } from '@/lib/chat/chat-history-context';
import type { ContactContext, DashboardCardContext } from '@/lib/chat/chat-history';

type DashboardCardProps = {
  title: string;
  subtitle?: string;
  insight?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  chatContext?: Omit<DashboardCardContext, 'type'>;
  chatContactContext?: ContactContext;
  children: ReactNode;
  className?: string;
};

export function DashboardCard({ title, subtitle, chatContext, chatContactContext, badge, actions, children, className }: DashboardCardProps) {
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

  return (
    <div className={cn('flex h-full flex-col overflow-hidden rounded-2xl bg-black/3 dark:bg-white/4', className)}>
      <div className="flex items-center gap-2 px-6 pt-5 pb-1">
        <div className="flex min-w-0 flex-1 items-baseline gap-1.5">
          {badge}
          <h3 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {title}
          </h3>
          {subtitle && (
            <>
              <span className="text-black/20 dark:text-white/20">·</span>
              <span className="truncate text-sm text-black/55 dark:text-white/45">{subtitle}</span>
            </>
          )}
        </div>
        {actions}
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-auto px-6 pt-2">{children}</div>
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
