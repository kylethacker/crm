'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { XIcon } from '@/components/icons';
import { useChatHistory } from '@/lib/chat/chat-history-context';
import { formatRelativeTime } from '@/lib/format';

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="4" rx="1" />
        <rect x="3" y="14" width="7" height="4" rx="1" />
        <rect x="14" y="11" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    label: 'Messages',
    href: '/messages',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    label: 'Agents',
    href: '/team',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sessions, activeSessionId, createSession, selectSession, deleteSession } = useChatHistory();

  const handleNewChat = () => {
    createSession();
    router.push('/chat');
  };

  const handleSelectSession = (id: string) => {
    selectSession(id);
    if (pathname !== '/chat') router.push('/chat');
  };

  return (
    <aside className="flex h-dvh w-64 shrink-0 flex-col border-r border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
      {/* Logo + brand */}
      <div className="flex shrink-0 items-center gap-2.5 px-4 py-4">
        <div className="flex size-7 items-center justify-center rounded-lg bg-neutral-900 dark:bg-white">
          <span className="text-xs font-bold text-white dark:text-neutral-900">CRM</span>
        </div>
        <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">AI CRM</span>
      </div>

      {/* Nav items */}
      <nav className="flex shrink-0 flex-col gap-0.5 px-3">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-neutral-100'
                  : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-300',
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 my-3 border-t border-neutral-200 dark:border-neutral-800" />

      {/* New chat button */}
      <div className="shrink-0 px-3">
        <button
          type="button"
          onClick={handleNewChat}
          className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-neutral-500 transition-colors hover:bg-neutral-200/60 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New chat
        </button>
      </div>

      {/* Chat history list */}
      <div className="mt-1 min-h-0 flex-1 overflow-y-auto px-3 pb-3">
        {sessions.length === 0 ? (
          <p className="px-2.5 py-3 text-xs text-neutral-400">No conversations yet</p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => handleSelectSession(session.id)}
                  className={cn(
                    'group flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors',
                    isActive
                      ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-neutral-100'
                      : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-300',
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{session.title}</p>
                    <p className="text-xs text-neutral-400">{formatRelativeTime(session.createdAt)}</p>
                  </div>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSession(session.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }
                    }}
                    className="shrink-0 rounded p-0.5 opacity-0 transition-opacity hover:bg-neutral-300/60 group-hover:opacity-100 dark:hover:bg-neutral-600"
                    aria-label={`Delete ${session.title}`}
                  >
                    <XIcon width={12} height={12} />
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom */}
      <div className="shrink-0 border-t border-neutral-200 px-3 py-3 dark:border-neutral-800">
        <ThemeToggle />
      </div>
    </aside>
  );
}
